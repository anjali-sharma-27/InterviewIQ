import { apiClient, API_ROOT } from "./client";

const API_URL = `${API_ROOT}/users`;

interface RegisterUserPayload {
  name: string;
  email: string;
  password: string;
  firebaseUID?: string;
}

interface LoginUserPayload {
  email?: string;
  password?: string;
  firebaseUID?: string;
}

interface EditUserPayload {
  name?: string;
  email?: string;
}

export const getUser = async () => {
  const response = await apiClient.get(`${API_URL}/getuserdetails`);
  return response.data;
};

export const registerUser = async (userData: RegisterUserPayload) => {
  const response = await apiClient.post(`${API_URL}/register`, userData);
  return response.data;
};

export const loginUser = async (userData: LoginUserPayload) => {
  const response = await apiClient.post(`${API_URL}/login`, userData);
  return response.data;
};

export const editUser = async (userData: EditUserPayload) => {
  const response = await apiClient.put(`${API_URL}/edit`, userData);
  return response.data;
};

export const logoutUser = async () => {
  const response = await apiClient.post(`${API_URL}/logout`, {});
  return response.data;
};
