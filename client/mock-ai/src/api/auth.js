// client/src/api/auth.js

// Use env variable if available, otherwise fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Auth endpoints
export const AUTH_API = `${API_BASE_URL}/api/auth`;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
export const GOOGLE_LOGIN_URL = `${AUTH_API}/google`;
export const DASHBOARD_URL = `${AUTH_API}/dashboard`;

export { API_BASE_URL };
