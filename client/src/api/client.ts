import axios from "axios";

const normalizeApiRoot = (baseUrl: string): string => {
  const trimmed = baseUrl.replace(/\/$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

export const API_ROOT = normalizeApiRoot(
  import.meta.env.VITE_API_BASE_URL || ""
);

export const apiClient = axios.create({
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
