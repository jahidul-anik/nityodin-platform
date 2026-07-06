Task ID: 1
Agent: main (full-stack-developer)
Task: Build Real-time WebSocket mini-service + Notification System

Work Log:
- Created `mini-services/realtime-service/index.ts` — Socket.io server on port 3003 with REST `/api/emit` endpoint and `/health` check. Users join rooms by userId. Events: `notification:new`, `wallet:updated`, `order:status_changed`, `service:status_changed`.
- Created `mini-services/realtime-service/package.json` with socket.io dependency, started with `bun run index.ts`.
- Created `src/store/notification-store.ts` — Zustand store with `notifications`, `unreadCount`, `addNotification`, `markAsRead`, `markAllAsRead`, `setNotifications`. Notification type: `{ id, type, title, message, data?, isRead, createdAt }`.
- Created `src/app/api/notifications/route.ts` — GET (fetch 50 notifications for first user, desc) and POST (create + emit via WebSocket).
- Created `src/app/api/notifications/[id]/route.ts` — PATCH mark single notification as read.
- Created `src/app/api/notifications/bulk-read/route.ts` — PATCH mark all notifications as read for a userId.
- Rewrote `src/components/nityodin/top-nav.tsx` — Replaced DEMO_NOTIFICATIONS with real notification center. Uses `useNotificationStore` for badge count. Fetches notifications from `/api/notifications` on popover open. Each notification has type-based icon (Package, CreditCard, CalendarCheck, Stethoscope). Click to mark as read. "Mark all as read" button. "View All" navigates to notifications view. Connects to Socket.io on mount via lazy `socket.io-client` import, joins user room, listens for `notification:new` to show toast + update store.
- Created `src/components/nityodin/notification-center.tsx` — Full page notification list with tabs (All, Unread, Orders, Wallet, Appointments). Notification cards with icon, title, message, time ago. Click to mark as read + navigate to relevant view. Refresh button. Empty state with BellOff illustration. Loading skeleton state.
- Updated `src/store/platform-store.ts` — Added `'notifications'` to `ActiveView` type union.
- Updated `src/app/page.tsx` — Added dynamic import for NotificationCenter, renders when `activeView === 'notifications'`.
- Updated `prisma/seed.ts` — Added 6 seed notifications for first user (order confirmed, payment received, appointment reminder, delivery completed, service request accepted, wallet top-up) with realistic time offsets and read/unread states.
- Updated `src/app/api/orders/route.ts` — POST now creates a notification + emits `order:status_changed` via WebSocket (fire-and-forget).
- Updated `src/app/api/wallet/route.ts` — POST now creates a notification + emits `wallet:updated` via WebSocket (fire-and-forget).
- Updated `src/app/api/appointments/route.ts` — POST now creates a notification + emits `notification:new` via WebSocket (fire-and-forget). Also fixed GET to use `success()` wrapper for consistent response shape.

Stage Summary:
- WebSocket mini-service running on port 3003 with REST emit endpoint
- 3 new notification API routes (GET, POST, PATCH, bulk-read)
- Zustand notification store with full CRUD actions
- Top nav bell icon shows real unread count badge, popover shows latest 5 notifications
- Full Notification Center page with tabs, empty states, loading skeletons
- All three write APIs (orders, wallet, appointments) now create real-time notifications
- 6 seed notifications added for first user
- ESLint: 0 errors, 0 warnings
- TypeScript: clean