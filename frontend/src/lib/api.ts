import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const api = axios.create({ baseURL: API_URL });

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const createTeam = (data: {
  teamName: string;
  name: string;
  email: string;
  password: string;
}) => api.post("/api/auth/create-team", data);

export const joinTeam = (data: {
  inviteCode: string;
  name: string;
  email: string;
  password: string;
}) => api.post("/api/auth/join-team", data);

export const login = (data: { email: string; password: string }) =>
  api.post("/api/auth/login", data);

// Standup
export const submitStandup = (data: {
  yesterday: string;
  today: string;
  blockerDescription?: string;
}) => api.post("/api/standup", data);

export const getMyEntries = () => api.get("/api/standup/mine");

// Dashboard
export const getDashboard = () => api.get("/api/dashboard");

// Blockers
export const resolveBlocker = (id: number) =>
  api.patch(`/api/blockers/${id}/resolve`);

export default api;
