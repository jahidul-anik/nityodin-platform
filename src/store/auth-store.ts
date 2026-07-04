import { create } from 'zustand';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** The authenticated user profile stored in state. */
export interface CurrentUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
  city?: string;
  roles: string[];
}

export interface AuthState {
  /** Whether the user has an active session. */
  isAuthenticated: boolean;
  /** The currently authenticated user, or `null` if logged out. */
  currentUser: CurrentUser | null;

  // -- Actions -------------------------------------------------------------

  /**
   * Authenticate the user and persist their profile in the store.
   * Typically called after a successful login API response.
   * @param user - The user object returned from the authentication backend.
   */
  login: (user: CurrentUser) => void;

  /**
   * End the current session and clear all user data from the store.
   */
  logout: () => void;

  /**
   * Perform a partial update on the current user's profile (e.g. after
   * editing name, avatar, city, etc.).
   * @param data - A partial object of fields to merge into the existing profile.
   */
  updateProfile: (data: Partial<CurrentUser>) => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useAuthStore = create<AuthState>()((set) => ({
  isAuthenticated: false,
  currentUser: null,

  login: (user) =>
    set({
      isAuthenticated: true,
      currentUser: user,
    }),

  logout: () =>
    set({
      isAuthenticated: false,
      currentUser: null,
    }),

  updateProfile: (data) =>
    set((state) => {
      if (!state.currentUser) return state;

      return {
        currentUser: { ...state.currentUser, ...data },
      };
    }),
}));