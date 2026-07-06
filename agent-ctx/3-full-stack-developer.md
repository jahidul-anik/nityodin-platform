# Task 3 — Image Upload System

## Files Created
- `src/app/api/upload/route.ts` — POST endpoint for multipart file upload
- `src/app/api/farm-products/[id]/route.ts` — PUT/DELETE for farm product CRUD
- `src/components/nityodin/image-upload.tsx` — Reusable drag-and-drop image upload component

## Files Modified
- `src/components/nityodin/merchant-dashboard.tsx` — Full rewrite with tabs + product CRUD
- `src/components/nityodin/farmer-dashboard.tsx` — Full rewrite with tabs + farm product CRUD
- `src/components/nityodin/profile-section.tsx` — Avatar upload + profile save to API
- `src/app/api/users/me/route.ts` — Added PUT handler for profile updates
- `prisma/seed.ts` — Added imageUrl to all 12 products + 8 farm products

## Assets Created
- `public/uploads/product/placeholder-1.svg` — Green grocery placeholder
- `public/uploads/product/placeholder-2.svg` — Amber electronics placeholder
- `public/uploads/product/placeholder-3.svg` — Teal clothing placeholder
- `public/uploads/farm/placeholder-1.svg` — Green farm placeholder
- `public/uploads/farm/placeholder-2.svg` — Orange fruit placeholder

## Verification
- ESLint: 0 errors, 0 warnings
- Database re-seeded with image URLs