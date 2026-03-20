import axios from "axios";
const API_BASE_URL = "https://fraudshield-xgpy.onrender.com";
export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  }
});
export default api;