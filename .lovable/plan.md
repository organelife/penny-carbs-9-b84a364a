

## Problem

The customer orders page (`/orders`) and order detail page show totals **without the delivery charge**. The `delivery_amount` field exists on the `orders` table but is not added to the displayed total.

## Fix

### 1. Orders list page (`src/pages/Orders.tsx`)
- On line 171, where the total is displayed as `order.customerTotal ?? order.total_amount`, add `order.delivery_amount` (defaults to 0) to the displayed value.

### 2. Order detail page (`src/pages/OrderDetail.tsx`)
- In the Order Items card total section (~line 278), add the delivery charge to the computed total.
- Add a visible "Delivery Charge" line item before the final total so customers can see the breakdown.

### Technical detail
- `order.delivery_amount` is a nullable numeric field (default 0) on the `orders` table.
- Both pages already fetch `orders.*`, so no additional query changes needed.
- The delivery charge line will show as `₹0` or be hidden when there's no charge.

