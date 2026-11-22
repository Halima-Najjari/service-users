export const API_ENDPOINTS = {
  auth: {
    login: "/api/auth/login",
    refresh: "/api/auth/refresh",
    logout: "/api/auth/logout",
  },
  users: {
    base: "/api/users",
    byRole: (role) => `/api/users/role/${role}`,
    delete: (userId) => `/api/users/${userId}`,
  },
  candidates: {
    base: "/api/candidates",
    byId: (candidateId) => `/api/candidates/${candidateId}`,
    byStatus: (status) => `/api/candidates/status/${status}`,
    uploadCv: (candidateId) => `/api/candidates/${candidateId}/upload-cv`,
    downloadCv: (candidateId) => `/api/candidates/${candidateId}/cv`,
  },
  evaluations: {
    all: "/api/evaluations/all",
  },
};
