
I checked the actual code and the issue is a bit bigger than just one filter.

What I found
- `src/hooks/useCook.ts` already does the frontend safety check: it fetches `orders.status` and filters out `status === 'cancelled'`.
- But the connected Supabase context shows the cancellation function exists while the database currently has no trigger on `public.orders`, so the backend sync is not reliably active.
- The cook dashboard is also stale in real time:
  - `useCookOrders` only refreshes every 2 minutes.
  - `src/hooks/useCookNotifications.ts` only listens for `INSERT` on `order_assigned_cooks`.
  - The notification loader/popup never checks `orders.status`, so a cancelled order can stay visible in the “New Order Assignment” modal or active list until refresh/timer expiry.

Implementation plan
1. Repair the database sync with a new follow-up migration
   - Do not edit the old migration; add a new repair migration.
   - Safely `DROP TRIGGER IF EXISTS on_order_cancelled ON public.orders`.
   - Recreate the `on_order_cancelled` trigger to call `public.handle_order_cancellation()`.
   - Add a one-time backfill so already-cancelled orders immediately update related `order_assigned_cooks` rows to `rejected`.

2. Make cook dashboard update immediately
   - Extend `src/hooks/useCookNotifications.ts` to subscribe to:
     - `UPDATE` on `orders` and react when `status` becomes `cancelled`
     - `UPDATE` on `order_assigned_cooks` for the current cook and react when `cook_status` becomes `rejected`
   - On those events:
     - invalidate `['cook-orders']`
     - remove the matching order from local `pendingOrders`
   - Keep the 2-minute polling only as fallback.

3. Stop cancelled orders from appearing in the popup
   - In `fetchOrderDetails`, also select `status` from `orders`.
   - If the parent order is already `cancelled`, return `null` instead of creating a pending notification card.
   - In the initial pending-loader, skip any assignment whose order is cancelled.

4. Keep the existing defense-in-depth filter
   - Leave the `useCookOrders` cancelled-order filter in place.
   - Optionally clean up the typing so the hook no longer needs `(o as any).status`.

Files likely affected
- `supabase/migrations/<new_repair_migration>.sql`
- `src/hooks/useCookNotifications.ts`
- possibly a small cleanup in `src/hooks/useCook.ts` and/or `src/types/cook.ts`

Expected result
```text
customer cancels order
  -> orders.status = cancelled
  -> DB trigger sets order_assigned_cooks.cook_status = rejected
  -> realtime invalidates cook queries and removes popup item
  -> cancelled order disappears immediately from /cook/dashboard
```

Validation to run after implementation
- Cancel a pending order while the cook popup is open: popup item should disappear immediately.
- Cancel an accepted/preparing/cooked order: it should disappear from the Active tab without waiting 2 minutes.
- Reload `/cook/dashboard`: the cancelled order should not come back.
