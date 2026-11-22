import apiClient from "./client";
import { API_ENDPOINTS } from "./endpoints";

export async function getUsers() {
  const response = await apiClient.get(API_ENDPOINTS.users.base);
  return response.data;
}

export async function createUser(payload) {
  const response = await apiClient.post(API_ENDPOINTS.users.base, payload);
  return response.data;
}

export async function deleteUser(userId) {
  await apiClient.delete(API_ENDPOINTS.users.delete(userId));
}
