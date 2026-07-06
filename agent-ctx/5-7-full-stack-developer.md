---
Task ID: 5-7
Agent: full-stack-developer
Task: Build core infrastructure, seed data, and harden API routes

Work Log:
- Created /home/z/my-project/src/lib/api-response.ts with standardized response helpers (success, error, paginated, created, noContent)
- Created /home/z/my-project/src/lib/errors.ts with custom error classes (AppError, NotFoundError, ValidationError, UnauthorizedError, ForbiddenError, ConflictError, InsufficientFundsError, WalletFrozenError, EscrowError)
- Created /home/z/my-project/src/lib/middleware.ts with Zod validation helpers (validateBody, validateQuery, paginationSchema)
- Created /home/z/my-project/prisma/seed.ts with comprehensive seed data for all 6 modules:
  - 5 users with multiple roles (consumer, merchant, farmer, service_provider)
  - 5 wallets with balances ৳1,000-৳5,000
  - 12 retail products (grocery, electronics, clothing, household) with Bangla names
  - 8 farm products (rice, vegetables, fruits, fish, honey) with organic flags
  - 6 market prices (Kawran Bazar, New Market)
  - 8 services (business: accounting, legal, IT, web dev; domestic: cleaning, plumbing, electrical, tutoring)
  - 5 service requests (pending, accepted, in_progress, completed)
  - 4 doctors (General Medicine, Cardiology, Orthopedics, Gynecology)
  - 4 appointments (scheduled, completed, cancelled)
  - 3 medical reports (blood_test, x_ray, ultrasound) at Popular Diagnostic and Ibn Sina
  - 4 business locations (Dhaka, Chittagong, Rajshahi)
  - 6 orders with 1-3 items each (pending, confirmed, preparing, delivered, cancelled)
  - 5 reviews (ratings 3-5)
- Ran seed script successfully, populating all tables
- Added "prisma": { "seed": "bun run prisma/seed.ts" } to package.json
- Added POST endpoint to /api/wallet for top-ups (validates body with Zod, checks frozen wallet, atomic transaction)
- Hardened /api/wallet/transfer with atomic Prisma $transaction, InsufficientFundsError, WalletFrozenError, NotFoundError, Zod validation
- Added POST endpoint to /api/orders for creating orders (validates items, checks stock, calculates total, decrements stock in transaction, returns order with items)
- Updated GET /api/orders to use paginated response with pagination schema
- All API routes use api-response helpers and error classes from lib/
- ESLint passes clean (0 errors, 0 warnings)

Stage Summary:
- Core infrastructure layer complete with type-safe error handling and Zod validation
- All 6 modules have representative seed data with proper relational connections
- Wallet API now supports top-ups and transfers with proper validation and atomic safety
- Orders API supports creation with transactional stock management and paginated listing
- No `any` types used in wallet or order routes