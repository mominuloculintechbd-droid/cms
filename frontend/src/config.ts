// Centralized environment-aware configuration for API and Socket URLs

export const API_ORIGIN: string =
  import.meta.env.VITE_API_ORIGIN ||
  (import.meta.env.DEV ? 'http://localhost:3000' : 'http://192.168.10.109:3000');

export const API_URL: string =
  import.meta.env.VITE_API_URL || `${API_ORIGIN}/api`;

export const SOCKET_URL: string =
  import.meta.env.VITE_SOCKET_URL || API_ORIGIN;


