import apiClient from "./apiClient";

// ---------------------------------------------------------------------
// Patient endpoints
// ---------------------------------------------------------------------

export const addPatient = async (patientName, doctorId) => {
  const { data } = await apiClient.post("/patients", { patientName, doctorId: doctorId || null });
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
// Doctor endpoints
// ---------------------------------------------------------------------

export const getAllDoctors = async () => {
  const { data } = await apiClient.get("/doctors");
  return data;
};

export const addDoctor = async (name, department, averageConsultationTime) => {
  const { data } = await apiClient.post("/doctors", { name, department, averageConsultationTime });
  return data;
};

// ---------------------------------------------------------------------
// AI Prediction endpoints
// ---------------------------------------------------------------------

export const getPrediction = async (tokenNumber) => {
  const { data } = await apiClient.get(`/prediction/${tokenNumber}`);
  return data;
};

export const getPredictionAnalytics = async () => {
  const { data } = await apiClient.get("/prediction/analytics");
  return data;
};

// ---------------------------------------------------------------------
// Settings endpoints
// ---------------------------------------------------------------------

export const updateConsultationTime = async (averageConsultationTime) => {
  const { data } = await apiClient.put("/settings/time", { averageConsultationTime });
  return data;
};
