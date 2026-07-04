import { create } from 'zustand';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single item in the consumer shopping cart. */
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit?: string;
  imageUrl?: string;
}

/** Aggregate platform statistics shown on the dashboard. */
export interface PlatformStats {
  totalUsers: number;
  totalMerchants: number;
  totalProducts: number;
  totalOrders: number;
  totalTransactions: number;
  walletBalance: number;
  activeServices: number;
  doctorsAvailable: number;
  farmProducts: number;
}

/** Main view identifiers for the single-page application. */
export type ActiveView =
  | 'landing'
  | 'dashboard'
  | 'discover'
  | 'wallet'
  | 'medical'
  | 'profile';

/** Role identifiers — a single user identity can assume multiple roles. */
export type ActiveRole =
  | 'consumer'
  | 'merchant'
  | 'farmer'
  | 'service_provider';

/** Sub-tab within the Medical view. */
export type MedicalTab = 'reports' | 'doctors' | 'appointments';

/** Dashboard data container (populated from API). */
export interface DashboardData {
  stats: PlatformStats | null;
  recentOrders: any[];
  walletTransactions: any[];
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

export interface PlatformState {
  // -- Current view / navigation -------------------------------------------
  activeView: ActiveView;
  activeTab: string;

  // -- Role management (Single Identity, Multiple Roles) -------------------
  activeRole: ActiveRole;
  availableRoles: string[];

  // -- Cart (consumer) -----------------------------------------------------
  cart: CartItem[];

  // -- Wallet --------------------------------------------------------------
  walletBalance: number;

  // -- UI state ------------------------------------------------------------
  sidebarOpen: boolean;
  isLoading: boolean;
  notificationCount: number;

  // -- Dashboard data (populated from API) ---------------------------------
  dashboardData: DashboardData;

  // -- Discover ------------------------------------------------------------
  discoverCategory: string;
  discoverRadius: number;

  // -- Medical -------------------------------------------------------------
  medicalTab: MedicalTab;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export interface PlatformActions {
  /**
   * Switch the main top-level view of the application.
   * @param view - One of the supported view identifiers.
   */
  setActiveView: (view: ActiveView) => void;

  /**
   * Switch the active sub-tab within the current view.
   * @param tab - Arbitrary string identifier for the sub-tab.
   */
  setActiveTab: (tab: string) => void;

  /**
   * Switch the user's active role.
   * This is the core "Single Identity, Multiple Roles" feature — one user can
   * seamlessly switch between consumer, merchant, farmer, and service_provider
   * perspectives without re-authenticating.
   * @param role - The role to activate.
   */
  setActiveRole: (role: ActiveRole) => void;

  /**
   * Add an item to the cart. If the product already exists its quantity is
   * incremented by the given amount.
   * @param item - The cart item to add (quantity is used as the increment).
   */
  addToCart: (item: CartItem) => void;

  /**
   * Remove an item from the cart entirely.
   * @param productId - The unique product identifier to remove.
   */
  removeFromCart: (productId: string) => void;

  /**
   * Update the quantity of an existing cart item. If the quantity is set to
   * zero or below the item is removed from the cart.
   * @param productId - The unique product identifier.
   * @param quantity - The new absolute quantity.
   */
  updateCartQuantity: (productId: string, quantity: number) => void;

  /**
   * Remove all items from the cart.
   */
  clearCart: () => void;

  /**
   * Compute the total price of all items currently in the cart.
   * This is a **store getter** — call it as `usePlatformStore.getState().getCartTotal()`.
   * @returns The summed total of (price × quantity) for every cart item.
   */
  getCartTotal: () => number;

  /**
   * Set the user's wallet balance.
   * @param balance - The new balance value.
   */
  setWalletBalance: (balance: number) => void;

  /**
   * Toggle the mobile sidebar open / closed.
   */
  toggleSidebar: () => void;

  /**
   * Set the global loading indicator.
   * @param loading - Whether the platform is in a loading state.
   */
  setLoading: (loading: boolean) => void;

  /**
   * Replace the entire dashboard data payload (typically after an API fetch).
   * @param data - The new dashboard data.
   */
  setDashboardData: (data: DashboardData) => void;

  /**
   * Set the active category filter in the Discover view.
   * @param category - Category identifier string.
   */
  setDiscoverCategory: (category: string) => void;

  /**
   * Set the search radius (in km) used in the Discover view.
   * @param radius - Radius in kilometres.
   */
  setDiscoverRadius: (radius: number) => void;

  /**
   * Switch the active sub-tab within the Medical view.
   * @param tab - One of `'reports' | 'doctors' | 'appointments'`.
   */
  setMedicalTab: (tab: MedicalTab) => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const usePlatformStore = create<PlatformState & PlatformActions>()(
  (set, get) => ({
    // ── Initial state ─────────────────────────────────────────────────────
    activeView: 'landing',
    activeTab: '',
    activeRole: 'consumer',
    availableRoles: ['consumer', 'merchant', 'farmer', 'service_provider'],
    cart: [],
    walletBalance: 0,
    sidebarOpen: false,
    isLoading: false,
    notificationCount: 0,
    dashboardData: {
      stats: null,
      recentOrders: [],
      walletTransactions: [],
    },
    discoverCategory: 'all',
    discoverRadius: 10,
    medicalTab: 'reports',

    // ── Actions ───────────────────────────────────────────────────────────

    setActiveView: (view) =>
      set({ activeView: view, activeTab: '' }),

    setActiveTab: (tab) =>
      set({ activeTab: tab }),

    setActiveRole: (role) =>
      set({ activeRole: role }),

    addToCart: (item) =>
      set((state) => {
        const existing = state.cart.find(
          (c) => c.productId === item.productId,
        );

        if (existing) {
          return {
            cart: state.cart.map((c) =>
              c.productId === item.productId
                ? { ...c, quantity: c.quantity + item.quantity }
                : c,
            ),
          };
        }

        return { cart: [...state.cart, { ...item }] };
      }),

    removeFromCart: (productId) =>
      set((state) => ({
        cart: state.cart.filter((c) => c.productId !== productId),
      })),

    updateCartQuantity: (productId, quantity) =>
      set((state) => {
        if (quantity <= 0) {
          return {
            cart: state.cart.filter((c) => c.productId !== productId),
          };
        }

        return {
          cart: state.cart.map((c) =>
            c.productId === productId ? { ...c, quantity } : c,
          ),
        };
      }),

    clearCart: () =>
      set({ cart: [] }),

    getCartTotal: () => {
      const { cart } = get();
      return cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      );
    },

    setWalletBalance: (balance) =>
      set({ walletBalance: balance }),

    toggleSidebar: () =>
      set((state) => ({ sidebarOpen: !state.sidebarOpen })),

    setLoading: (loading) =>
      set({ isLoading: loading }),

    setDashboardData: (data) =>
      set({ dashboardData: data }),

    setDiscoverCategory: (category) =>
      set({ discoverCategory: category }),

    setDiscoverRadius: (radius) =>
      set({ discoverRadius: radius }),

    setMedicalTab: (tab) =>
      set({ medicalTab: tab }),
  }),
);