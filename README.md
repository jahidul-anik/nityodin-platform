# Nityodin - Single Identity, Multiple Roles | Citizen-Centric Digital Ecosystem

> A comprehensive Bangladesh citizen-centric digital platform unifying six ecosystem pillars — supply chain, retail, business services, domestic services, medical diagnostics, and digital payments — under a single identity with multiple roles.

---

**Live URL:** [https://nityodin-platform.vercel.app](https://nityodin-platform.vercel.app)
**GitHub:** [https://github.com/jahidul-anik/nityodin-platform](https://github.com/jahidul-anik/nityodin-platform)

---

## Overview

Nityodin (নিত্যদিন — "Everyday") is a digital ecosystem purpose-built for Bangladesh citizens. Rather than juggling dozens of fragmented apps for shopping, farming, healthcare, and payments, Nityodin consolidates everything into a single platform where one verified identity powers every interaction.

A user can be a **consumer** browsing products, a **merchant** managing a storefront, a **farmer** listing harvests, and a **service provider** accepting requests — all from the same account, switching roles seamlessly without re-authentication.

---

## Six Ecosystem Pillars

| # | Pillar | Description |
|---|--------|-------------|
| 1 | **Supply Chain & Agriculture** | Farmers list produce, track market prices, and connect directly with buyers. Includes organic certification badges and harvest-date tracking. |
| 2 | **Retail & Community Commerce** | Full-featured marketplace with product listings, reviews, order management, cart, and delivery options. Bengali-localised names and categories. |
| 3 | **Business Services** | Service providers offer professional services (photography, auto repair, electrical, plumbing, beauty) with booking, scheduling, and pricing. |
| 4 | **Domestic Services** | In-home and on-demand service requests with status tracking, quoted/final pricing, and address-based scheduling. |
| 5 | **Diagnostic & Medical Hub** | Digital medical reports with QR-based sharing, doctor directories with appointment booking, and report history management. |
| 6 | **Digital Wallet & Payments** | Built-in wallet with balance tracking, P2P transfers, transaction history, and CSV export. Foundation for a full payment rails layer. |

---

## Key Features

- **Single Identity, Multiple Roles** — One account, four roles (Consumer, Merchant, Farmer, Service Provider). Switch perspectives instantly.
- **Interactive Map View** — Discover merchants, service providers, and business locations on a radius-based map with category filters.
- **Digital Wallet with P2P Transfers** — In-app wallet supporting balance queries, peer-to-peer transfers, and transaction export.
- **Merchant Storefronts** — Full merchant profile pages with product catalogs, farm products, service listings, store banner/logo, verification badges, and rating aggregation.
- **Medical Hub** — Upload, view, and QR-share medical reports. Browse doctors by specialty, book appointments, and track scheduling status.
- **Market Price Dashboard** — Real-time commodity price tracking with trend visualization and price-change indicators.
- **Supply Chain Tracker** — End-to-end visibility into agricultural product flow from farm to consumer.
- **Smart Cart & Checkout** — Persistent cart with quantity management, price totals, and delivery option selection.
- **Business Location Manager** — Register and manage business locations with geocoordinates, operating status, and category tagging.
- **Role-Based Dashboards** — Dedicated dashboard views for consumers, merchants, farmers, and service providers with relevant metrics and actions.
- **Bengali Localization** — Full Bangla (বাংলা) translation support via `next-intl` with language-agnostic product naming (`name` + `nameBn` fields).
- **Graceful Demo Fallback** — All API routes fall back to rich in-memory demo data when a database is unavailable, ensuring the app works out-of-the-box on Vercel.
- **Runtime Chunk Loading** — Heavy views (Dashboard, Discover, Wallet, Medical, Profile, Merchant Storefront) are loaded on-demand via `React.lazy` / `dynamic()` imports after initial render.
- **Security Headers** — CSP, HSTS, X-Frame-Options, XSS protection, and strict referrer policy configured in `vercel.json`.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | **Next.js 16** (App Router, React 19) |
| Language | **TypeScript 5** |
| Styling | **Tailwind CSS 4**, `tailwindcss-animate`, `tw-animate-css` |
| UI Components | **shadcn/ui** (40+ Radix UI primitives) |
| State Management | **Zustand 5** (platform, auth, locale, notification stores) |
| ORM | **Prisma 6** with `@prisma/adapter-libsql` |
| Database | **SQLite** (local) / **Turso** (production, libsql) |
| Animations | **Framer Motion 12** |
| Forms & Validation | **React Hook Form 7** + **Zod 4** + `@hookform/resolvers` |
| Data Fetching | **TanStack React Query 5** |
| Tables | **TanStack React Table 8** |
| Charts | **Recharts 2** |
| Authentication | **NextAuth 4** (pluggable) |
| Internationalization | **next-intl 4** (English + Bengali) |
| Icons | **Lucide React** |
| Drag & Drop | **@dnd-kit** |
| Carousel | **Embla Carousel** |
| Toasts | **Sonner** |
| Markdown | **react-markdown** + **react-syntax-highlighter** |
| Date Utilities | **date-fns 4** |
| Package Manager | **Bun** |
| Deployment | **Vercel** with GitHub Actions CI/CD |

---

## Project Structure

```
nityodin-platform/
├── prisma/
│   ├── schema.prisma          # Database schema (16 models)
│   └── seed.ts                # Database seeder
├── src/
│   ├── app/
│   │   ├── page.tsx           # Root SPA entry — view router with ErrorBoundary
│   │   ├── layout.tsx         # Root layout (fonts, metadata, providers)
│   │   ├── globals.css        # Tailwind + custom CSS variables
│   │   ├── api/               # 17 API route groups (see below)
│   │   └── middleware.ts      # Next.js middleware
│   ├── components/
│   │   ├── nityodin/          # 34 domain-specific components
│   │   │   ├── top-nav.tsx
│   │   │   ├── hero-section.tsx
│   │   │   ├── dashboard-shell.tsx
│   │   │   ├── discover-section.tsx
│   │   │   ├── wallet-section.tsx
│   │   │   ├── medical-section.tsx
│   │   │   ├── merchant-storefront.tsx
│   │   │   ├── profile-section.tsx
│   │   │   ├── map-view.tsx
│   │   │   ├── cart-drawer.tsx
│   │   │   ├── farmer-dashboard.tsx
│   │   │   ├── merchant-dashboard.tsx
│   │   │   ├── provider-dashboard.tsx
│   │   │   ├── consumer-dashboard.tsx
│   │   │   └── ... (20 more)
│   │   └── ui/                # 40+ shadcn/ui primitives
│   ├── store/
│   │   ├── platform-store.ts  # Main SPA state (views, cart, wallet, roles)
│   │   ├── auth-store.ts      # Authentication state
│   │   ├── locale-store.ts    # i18n locale state
│   │   └── notification-store.ts
│   ├── lib/
│   │   ├── db.ts              # Prisma client singleton
│   │   ├── demo-data.ts       # 650+ lines of rich demo/fallback data
│   │   ├── api-response.ts    # Standardised API response helpers
│   │   ├── api-error-handler.ts
│   │   ├── errors.ts
│   │   ├── utils.ts           # cn() and utilities
│   │   ├── middleware.ts
│   │   └── i18n/              # Translation files (en, bn)
│   └── hooks/
│       ├── use-toast.ts
│       └── use-mobile.ts
├── .env.example
├── vercel.json
├── package.json
└── .github/workflows/
    └── deploy.yml             # CI/CD → Vercel
```

---

## Architecture

### Single-Page Application with View Router

Nityodin uses Next.js App Router for the shell, but the main experience is a **client-side SPA** driven by Zustand's `activeView` state. The root `page.tsx` conditionally renders views based on the active view identifier:

```
landing → Hero + Stats + Features + How It Works
dashboard → DashboardShell (role-aware: consumer/merchant/farmer/provider)
discover → DiscoverSection (map, radius search, filters)
wallet → WalletSection (balance, transfers, history)
medical → MedicalSection (reports, doctors, appointments tabs)
profile → ProfileSection
merchant-storefront → MerchantStorefront (by merchantId)
```

### State Management (Zustand)

Four Zustand stores manage all client state:

| Store | Purpose |
|-------|---------|
| `platform-store.ts` | Active view, role, cart, wallet balance, discover filters, medical tab, dashboard data |
| `auth-store.ts` | Authentication state, user session, login/logout |
| `locale-store.ts` | Current locale (en/bn) |
| `notification-store.ts` | In-app notification state |

### API Routes with Demo Fallback

Every API route attempts a Prisma database query. If the database is unavailable (e.g., Vercel serverless without Turso configured), it gracefully falls back to the rich in-memory demo data in `demo-data.ts`. This means **the app works immediately after cloning** without any database setup.

### Runtime Chunk Loading

Landing-page components (TopNav, Hero, Stats, Features, HowItWorks, Footer) are loaded via `next/dynamic` with `ssr: false`. All other views (Dashboard, Discover, Wallet, Medical, Profile, MerchantStorefront, CartDrawer) are loaded on-demand via `import()` inside a `useCallback` — only when the user navigates away from the landing page for the first time.

---

## Database Models

The Prisma schema defines **16 models** organized into 7 domains:

### Core Identity
- **User** — Phone-verified citizen profile with NID verification, location hierarchy (city/district/division)
- **UserRole** — Many-to-many role assignment (consumer, merchant, farmer, service_provider) with active toggle

### Digital Wallet
- **Wallet** — Per-user wallet with balance and freeze flag
- **Transaction** — Wallet transactions with type, amount, reference, payment method, and status

### Retail & Commerce
- **Product** — Merchant product listings with bilingual names, categories, ratings, stock, and optional store linkage
- **Review** — User product reviews with ratings and comments
- **Order** — Buyer-seller orders with payment/delivery tracking
- **OrderItem** — Individual line items within an order

### Agriculture
- **FarmProduct** — Farmer produce listings with organic certification, harvest dates, and origin tracking
- **MarketPrice** — Commodity market prices with unit, change percentage, and market source

### Services
- **Service** — Service provider listings with fixed/hybrid pricing, availability, and categories
- **ServiceRequest** — Customer-to-provider booking requests with scheduling, quoting, and status

### Medical Hub
- **MedicalReport** — User medical reports with QR sharing, time-limited access, and lab/doctor metadata
- **Doctor** — Doctor directory with specialty, qualification, hospital, fees, and available slots
- **Appointment** — User-doctor appointment scheduling with status tracking

### Business & Stores
- **BusinessLocation** — Geocoded business locations with categories, operating status, and ratings
- **Store** — Merchant storefronts with slug, branding, verification, sales metrics, and geocoordinates
- **InventorySync** — Unified inventory tracking across products, farm products, and services per store

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth` | Phone-based login/registration |
| POST | `/api/auth/verify` | OTP verification |
| POST | `/api/auth/logout` | Session logout |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current user profile, roles, and wallet |

### Platform
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/platform/stats` | Aggregate platform statistics |
| GET | `/api` | API health / info |

### Products & Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (with filters) |
| GET | `/api/products/[id]` | Get product detail |
| GET/POST | `/api/orders` | List / create orders |
| GET/PATCH | `/api/orders/[id]` | Get / update order status |
| GET/POST | `/api/reviews` | List / create reviews |

### Merchants & Stores
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/merchants` | List merchants/stores |
| GET | `/api/merchants/[id]` | Get merchant detail with storefront |
| GET | `/api/analytics/merchant` | Merchant analytics data |

### Services
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/services` | List services (with filters) |
| GET | `/api/services/[id]` | Get service detail |
| GET/POST | `/api/service-requests` | List / create service requests |
| GET/PATCH | `/api/service-requests/[id]` | Get / update service request |

### Agriculture
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/farm-products` | List farm products |
| GET | `/api/farm-products/[id]` | Get farm product detail |
| GET | `/api/market-prices` | Current market prices |
| GET | `/api/market-prices/trends` | Price trend history |

### Medical Hub
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/doctors` | List doctors (with specialty filter) |
| GET | `/api/doctors/[id]` | Get doctor detail |
| GET/POST | `/api/appointments` | List / create appointments |
| GET/POST | `/api/medical-reports` | List / upload medical reports |
| POST | `/api/medical-reports/share` | Share a report with another user |
| GET | `/api/medical-reports/qr` | Generate QR code for report sharing |

### Wallet
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wallet` | Get wallet balance and transactions |
| POST | `/api/wallet/transfer` | Initiate P2P wallet transfer |
| GET | `/api/wallet/export` | Export transactions as CSV |

### Discover & Location
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/discover` | Discover merchants/services by location & radius |
| GET | `/api/business-locations` | List all registered business locations |

---

## Getting Started

### Prerequisites

- **Node.js** >= 18 or **Bun** >= 1.0
- **npm**, **yarn**, or **bun** as package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/jahidul-anik/nityodin-platform.git
cd nityodin-platform

# Install dependencies
bun install
# or: npm install

# Generate Prisma client
bun run db:generate
# or: npx prisma generate

# (Optional) Push schema to local SQLite database
bun run db:push
# or: npx prisma db push

# (Optional) Seed the database with demo data
bun run db:seed
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

```env
# Database (SQLite for local, Turso for Vercel)
DATABASE_URL="file:./custom.db"

# Optional: Turso for production
# DATABASE_URL="libsql://nityodin-yourname.turso.io"
# DATABASE_AUTH_TOKEN="your-turso-auth-token"

# Optional: NextAuth (if enabled)
# NEXTAUTH_URL="http://localhost:3000"
# NEXTAUTH_SECRET="your-secret-here"

# Optional: NID verification API
# NID_API_KEY="your-api-key"
```

> **Note:** The application works without any environment variables by falling back to in-memory demo data. Database setup is only needed for persistent storage.

### Running Locally

```bash
# Start development server on port 3000
bun dev
# or: npm run dev

# Build for production
bun run build
# or: npm run build

# Start production server
bun start
# or: npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Useful Scripts

```bash
bun run lint          # Run ESLint
bun run typecheck     # TypeScript type checking
bun run db:generate   # Regenerate Prisma client
bun run db:push       # Push schema changes to database
bun run db:seed       # Seed database with demo data
bun run db:migrate    # Run database migrations
bun run db:reset      # Reset database (destructive)
```

---

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in [Vercel Dashboard](https://vercel.com/new)
3. Set environment variables in the Vercel project settings:
   - `DATABASE_URL` — Turso libsql connection string
   - `DATABASE_AUTH_TOKEN` — Turso auth token
4. Deploy — Vercel handles the rest

The `vercel.json` is pre-configured with:
- Build command: `npx prisma generate && next build`
- Security headers (CSP, HSTS, X-Frame-Options, XSS protection)
- No-cache policy on all `/api/*` routes

### CI/CD with GitHub Actions

The included `.github/workflows/deploy.yml` automates deployment on push to `main`:

1. Checks out code
2. Sets up Bun runtime
3. Installs dependencies with `--frozen-lockfile`
4. Deploys to Vercel Production via CLI

Required GitHub Secrets:
- `VERCEL_TOKEN` — Vercel API token
- `VERCEL_ORG_ID` — Vercel organization ID
- `VERCEL_PROJECT_ID` — Vercel project ID

### Database Options

| Environment | Database | Configuration |
|-------------|----------|---------------|
| Local dev | **SQLite** (file-based) | `DATABASE_URL="file:./custom.db"` |
| Vercel / Production | **Turso** (libsql) | `DATABASE_URL="libsql://your-db.turso.io"` + `DATABASE_AUTH_TOKEN` |
| No database | **Demo fallback** | Works out of the box with in-memory data |

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | No | — | Database connection string. SQLite for local (`file:./custom.db`), Turso libsql for production |
| `DATABASE_AUTH_TOKEN` | No | — | Turso authentication token (only for Turso databases) |
| `NEXTAUTH_URL` | No | — | NextAuth callback URL (e.g., `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | No | — | NextAuth session encryption secret |
| `NID_API_KEY` | No | — | API key for NID verification service |

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork** the repository and create a feature branch
2. Follow the existing code style (TypeScript strict, Tailwind CSS, shadcn/ui patterns)
3. Ensure all new API routes include a **demo-data fallback** for graceful degradation
4. Run `bun run typecheck` and `bun run lint` before committing
5. Write descriptive commit messages
6. Open a **Pull Request** with a clear description of changes

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>Nityodin</strong> — নিত্যদিন — Everyday Digital Ecosystem for Bangladesh
</p>