// src/api/auth.js

// Base API URL (set this in your .env for prod, defaults to localhost:4000 for dev)
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000";

// Auth endpoints
export const AUTH_BASE_URL = `${API_BASE_URL}/auth`;

export const GOOGLE_LOGIN_URL = `${AUTH_BASE_URL}/google`;
export const DASHBOARD_URL = `${AUTH_BASE_URL}/dashboard`;
