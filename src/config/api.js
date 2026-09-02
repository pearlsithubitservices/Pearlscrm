// Base API URL dynamically loaded from environment variables (.env)
const defaultApiUrl = import.meta.env.DEV
  ? 'http://localhost:5000/api'
  : 'https://pearlscrm.onrender.com/api';

export const BASE_URL = import.meta.env.VITE_API_URL || defaultApiUrl;

/**
 * Utility function to dynamically format API endpoints with VITE_API_URL.
 * Handles single slashes and path formatting automatically.
 * 
 * @param {string} path - API endpoint subpath (e.g., "/leads", "/projects/123")
 * @returns {string} Complete formatted API URL
 */
export const apiUrl = (path = "") => {
  if (!path) return BASE_URL;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  let cleanPath = path.startsWith("/") ? path : `/${path}`;

  const baseEndsWithApi = BASE_URL.replace(/\/+$/, "").endsWith("/api");
  if (baseEndsWithApi && cleanPath.startsWith("/api/")) {
    cleanPath = cleanPath.substring(4);
  }

  return `${BASE_URL.replace(/\/+$/, "")}${cleanPath}`;
};

export const appUrl = apiUrl;

export default apiUrl;
