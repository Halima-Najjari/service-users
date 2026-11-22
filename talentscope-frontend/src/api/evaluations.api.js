import apiClient from "./client";
import { API_ENDPOINTS } from "./endpoints";

export async function getAllEvaluations() {
  const response = await apiClient.get(API_ENDPOINTS.evaluations.all);
  return response.data;
}
