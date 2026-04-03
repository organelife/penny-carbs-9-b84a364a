

## Problem
The cook dashboard's "My Allocated Dishes" section has no image upload functionality. Cooks cannot add or update images for their allocated dishes.

## Root Cause
- `CookAllocatedDishes.tsx` does not include the `ImageUpload` component
- The `useCookAllocatedDishes` hook does not fetch `food_item_images`
- There are likely no RLS policies on `food_item_images` allowing cook-role inserts

## Plan

### 1. Database: Add RLS policy for cooks on `food_item_images`
Create a migration allowing cooks to insert/update/delete images for food items they are allocated via `cook_dishes`.

```sql
-- Allow cooks to manage images for their allocated dishes
CREATE POLICY "Cooks can insert images for their dishes"
ON public.food_item_images FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.cook_dishes cd
    JOIN public.cooks c ON c.id = cd.cook_id
    WHERE cd.food_item_id = food_item_images.food_item_id
      AND c.user_id = auth.uid()
  )
);

CREATE POLICY "Cooks can delete images for their dishes"
ON public.food_item_images FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.cook_dishes cd
    JOIN public.cooks c ON c.id = cd.cook_id
    WHERE cd.food_item_id = food_item_images.food_item_id
      AND c.user_id = auth.uid()
  )
);
```

Also add a storage policy on the `food-items` bucket for cook uploads if missing.

### 2. Update `useCookAllocatedDishes` hook
Add `food_item_images` to the select query so existing images are fetched:
```
food_item:food_items(id, name, price, ..., images:food_item_images(id, image_url, is_primary))
```

### 3. Update `CookAllocatedDishes.tsx`
- Import `ImageUpload` component
- For each dish card, show the current dish image (from `food_item_images`) and an `ImageUpload` button
- On upload complete: upsert into `food_item_images` (delete existing, insert new with `is_primary: true`)
- On remove: delete from `food_item_images`
- Invalidate query on success

### 4. Update `CookDish` type
Add optional `images` array to the `food_item` nested type in `src/types/cook-dishes.ts`.

### Files Changed
- `src/types/cook-dishes.ts` — add images to food_item type
- `src/hooks/useCookDishes.ts` — include food_item_images in query
- `src/components/cook/CookAllocatedDishes.tsx` — add ImageUpload per dish
- New migration — RLS policies for cook image management

