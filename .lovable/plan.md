

## Problem

The `/admin/storage-settings` page restricts access to `super_admin` role only. If you're logged in as `admin`, you see the "Access Denied" screen. The route, database table, and dashboard link are all correctly set up.

## Solution

Allow both `admin` and `super_admin` roles to access the Storage Settings page, consistent with the RLS policy on the `storage_providers` table which already grants access to both roles.

### Changes

**1. Update `src/pages/admin/AdminStorageSettings.tsx`**
- Change the access check from `role === 'super_admin'` to `role === 'super_admin' || role === 'admin'`
- Update the "Access Denied" message accordingly

**2. Update `src/pages/admin/AdminDashboard.tsx`**
- Move the "Storage Settings" card from the `superAdminUtilities` array (shown only to super_admins) into the general `managementCards` array, so all admins can see and access it

**3. Add nav link in `src/components/admin/AdminNavbar.tsx`**
- Add a "Storage" nav item for admin/super_admin roles so it's accessible from the top navigation bar on all admin pages

### Technical detail
- The database RLS policy already allows both `admin` and `super_admin` to manage `storage_providers`, so no database changes needed
- The `useStorageProviders` hook uses `as any` casts since `storage_providers` isn't in the generated Supabase types — this works fine at runtime

