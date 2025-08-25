import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type User = {
  id: string;
  username: string;
  email: string;
  name?: string;
  location?: string;
  profileImage?: string;
};

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signupSuccess: boolean;

  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => void;
  clearError: () => void;
  clearSignupSuccess: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initialize with a demo user for testing purposes
      user: {
        id: "demo-user",
        username: "demo",
        email: "demo@example.com",
        name: "Demo User"
      },
      isAuthenticated: true, // Auto-authenticate for demo
      isLoading: false,
      error: null,
      signupSuccess: false,

      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));

          // For demo, accept any non-empty username/password
          if (!username || !password) {
            throw new Error("Username and password are required");
          }

          // Mock user data
          const user: User = {
            id: "user-" + Date.now(),
            username,
            email: `${username}@example.com`,
            name: username.charAt(0).toUpperCase() + username.slice(1),
          };

          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Login failed",
            isLoading: false
          });
        }
      },

      signup: async (username: string, email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Validate inputs
          if (!username || !email || !password) {
            throw new Error("All fields are required");
          }

          if (!email.includes("@")) {
            throw new Error("Invalid email address");
          }

          if (password.length < 6) {
            throw new Error("Password must be at least 6 characters");
          }

          // Instead of logging in the user, just set signupSuccess to true
          set({ isLoading: false, signupSuccess: true });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Signup failed",
            isLoading: false
          });
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      updateProfile: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      clearSignupSuccess: () => {
        set({ signupSuccess: false });
      },
    }),
    {
      name: "agriaid-auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);