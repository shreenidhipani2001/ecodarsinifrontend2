// // src/lib/auth.ts
// import { apiFetch } from "./api";

// export async function login(email: string, password: string) {
//   console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);
//   console.log("Logging in with:", { email, password });
//   console.log(`${process.env.NEXT_PUBLIC_API_URL}/api/users/login`)
//   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/login`, {
//     method: "POST",
//     credentials: "include", // important for cookies
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ email, password }),
//   }).then(res => res.json());
// }

// export async function refreshToken() {
//   return apiFetch("/auth/refresh", {
//     method: "POST",
//   });
// }

// export async function logout() {
//   return apiFetch("/auth/logout", {
//     method: "POST",
//   });
// }

import { apiFetch } from "./api";
import { useAuthStore } from "../../ecoDarsiniFrontend/src/store/useAuthStore";
// import { useAu thStore } from "../store/useAuthStore";

/* ================= LOGIN ================= */
export async function login(email: string, password: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/users/login`,
    {
      method: "POST",
      credentials: "include", // ✅ cookie
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }
  );

  if (!res.ok) {
    throw new Error("Login failed");
  }

  const loginData = await res.json();
  console.log("Login Response Data:", loginData);

  // Fetch full user profile after successful login
  if (loginData.userId) {
    try {
      const userRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${loginData.userId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (userRes.ok) {
        const userData = await userRes.json();
        console.log("Full User Profile Data:", userData);

        // Store complete user data with proper structure
        const completeUser = {
          id: userData.user?.id || loginData.userId,
          name: userData.user?.name,
          email: userData.user?.email || loginData.email,
          role: userData.user?.role || loginData.role,
          phone: userData.user?.phone,
        };

        console.log("Setting complete user in auth store:", completeUser);
        useAuthStore.getState().setUser(completeUser);
        console.log("User after setting in store:", useAuthStore.getState().user);
        console.log("Login process completed successfully.",loginData);
        return loginData;
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  }

  // Fallback: store minimal login data if profile fetch fails
  useAuthStore.getState().setUser({
    id: loginData.userId,
    email: loginData.email,
    role: loginData.role,
  });

  return loginData;
}

/* ================= CURRENT USER ================= */
 
export async function getCurrentUser() {
  const userInStore = useAuthStore.getState().user;

  console.log("User in Store:", userInStore);

 

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/users/me`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userInStore?.id,
      }),
    }
  );

  if (!res.ok) return null;

  const data = await res.json();
  console.log("Current User Data:", data);

  return data ?? null;
}


/* ================= LOGOUT ================= */
export async function logout() {
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/logout`, {
    method: "POST",
    credentials: "include",
  });

  useAuthStore.getState().clearUser();
}
