/** API base URL. Empty string uses the Vite dev proxy (`/api` → Django). */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? ''
