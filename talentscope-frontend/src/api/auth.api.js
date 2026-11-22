import apiClient from "./client";
import { API_ENDPOINTS } from "./endpoints";

export async function loginRequest(email, password) {
  const response = await apiClient.post(API_ENDPOINTS.auth.login, {
    email,
    password,
  });
  return response.data;
}

export async function refreshRequest(refreshToken) {
  const response = await apiClient.post(API_ENDPOINTS.auth.refresh, {
    refreshToken,
  });
  return response.data;
}

export async function logoutRequest(refreshToken) {
  await apiClient.post(API_ENDPOINTS.auth.logout, { refreshToken });
}
