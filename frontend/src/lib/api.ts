import { useAuth } from "@clerk/clerk-react";

const API_URL = import.meta.env.VITE_API_URL; // e.g. http://localhost:3000

// Custom hook: gives components a `fetchApi` function with auth baked in
export function useApi() {
  const { getToken } = useAuth();

  async function fetchApi(path: string, options: RequestInit = {}) {
    const token = await getToken();

    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    if (res.status === 204) return null;

    return res.json();
  }

  return { fetchApi };
}