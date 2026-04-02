

## Problem
The "Add Banner" button and page header are hidden behind the fixed `AdminNavbar`. The navbar is `position: fixed` at the top, but `AdminBanners.tsx` has no top padding to offset it -- unlike pages like `AdminCategories`, `AdminItems`, and `AdminSpecialOffers` which use `pt-28`.

## Fix
Add `pt-28` to the root container div in `src/pages/admin/AdminBanners.tsx` (line 171), changing:
```
<div className="min-h-screen bg-background">
```
to:
```
<div className="min-h-screen bg-background pt-28">
```

This matches the pattern used by other admin pages that have the same layout.

