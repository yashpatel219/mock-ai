// src/api/auth.js
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000";

// All auth routes live under /api/auth
export const AUTH_BASE_URL = `${API_BASE_URL}/api/auth`;

export const GOOGLE_LOGIN_URL = `${AUTH_BASE_URL}/google`;
export const DASHBOARD_URL = `${AUTH_BASE_URL}/dashboard`;
export const ME_URL = `${AUTH_BASE_URL}/me`;
