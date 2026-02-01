// import { create } from "zustand";

// type User = {
//   id: string;
//   email: string;
//   role: string;
// };

// interface AuthState {
//   user: User | null;
//   isAuthenticated: boolean;
//   setUser: (user: User) => void;
//   clearUser: () => void;
// }

// export const useAuthStore = create<AuthState>((set) => ({
//   user: null,
//   isAuthenticated: false,

//   setUser: (user) =>
//     set({
//       user,
//       isAuthenticated: true,
//     }),

//   clearUser: () =>
//     set({
//       user: null,
//       isAuthenticated: false,
//     }),
// }));


import { create } from "zustand";
import { persist } from "zustand/middleware";

export type User = {
  id: string;
  email: string;
  role: "ADMIN" | "USER";
  name?: string;
  phone?: string;
};

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: true,
        }),

      clearUser: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "auth-store", // localStorage key
    }
  )
);
