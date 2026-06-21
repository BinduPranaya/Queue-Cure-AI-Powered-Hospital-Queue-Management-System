import apiClient from "./apiClient";

// ---------------------------------------------------------------------
// Patient endpoints
// ---------------------------------------------------------------------

export const addPatient = async (patientName) => {
  const { data } = await apiClient.post("/patients", { patientName });
  return data;
};

export const getAllPatients = async () => {
  const { data } = await apiClient.get("/patients");
  return data;
};

export const getWaitingPatients = async () => {
  const { data } = await apiClient.get("/patients/waiting");
  return data;
};

export const getPatientByToken = async (tokenNumber) => {
  const { data } = await apiClient.get(`/patients/token/${tokenNumber}`);
  return data;
};

export const removePatient = async (id) => {
  await apiClient.delete(`/patients/${id}`);
};

// ---------------------------------------------------------------------
// Queue endpoints
// ---------------------------------------------------------------------

export const getQueueStatus = async () => {
  const { data } = await apiClient.get("/queue/status");
  return data;
};

export const callNextPatient = async () => {
  const { data } = await apiClient.post("/queue/next");
  return data;
};

export const getQueueAnalytics = async () => {
  const { data } = await apiClient.get("/queue/analytics");
  return data;
};

// ---------------------------------------------------------------------
// Settings endpoints
// ---------------------------------------------------------------------

export const updateConsultationTime = async (averageConsultationTime) => {
  const { data } = await apiClient.put("/settings/time", { averageConsultationTime });
  return data;
};
