import apiClient from "./client";
import { API_ENDPOINTS } from "./endpoints";

export async function getCandidates() {
  const response = await apiClient.get(API_ENDPOINTS.candidates.base);
  return response.data;
}

export async function getCandidate(candidateId) {
  const response = await apiClient.get(
    API_ENDPOINTS.candidates.byId(candidateId),
  );
  return response.data;
}

export async function getCandidatesByStatus(status) {
  const response = await apiClient.get(
    API_ENDPOINTS.candidates.byStatus(status),
  );
  return response.data;
}

export async function createCandidate(payload) {
  const response = await apiClient.post(API_ENDPOINTS.candidates.base, payload);
  return response.data;
}

export async function patchCandidate(candidateId, payload) {
  const response = await apiClient.patch(
    API_ENDPOINTS.candidates.byId(candidateId),
    payload,
  );
  return response.data;
}

export async function deleteCandidate(candidateId) {
  await apiClient.delete(API_ENDPOINTS.candidates.byId(candidateId));
}

export async function uploadCandidateCv(candidateId, file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post(
    API_ENDPOINTS.candidates.uploadCv(candidateId),
    formData,
    {
      headers: { "Content-Type": undefined },
    },
  );
  return response.data;
}

export async function downloadCandidateCv(candidateId) {
  const response = await apiClient.get(
    API_ENDPOINTS.candidates.downloadCv(candidateId),
    {
      responseType: "blob",
    },
  );
  return response.data;
}
