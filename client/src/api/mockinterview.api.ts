import { apiClient, API_ROOT } from "./client";
import { MockInterview } from "@/vite-env";

const API_URL = `${API_ROOT}/mockinterview`;

export const createInterview = async (interviewData: MockInterview) => {
  const response = await apiClient.post(`${API_URL}/create`, interviewData);
  return response.data;
};

export const getAllInterviews = async () => {
  const response = await apiClient.get(`${API_URL}/`);
  return response.data;
};

export const getInterviewByID = async (interviewID: string) => {
  const response = await apiClient.get(`${API_URL}/${interviewID}`);
  return response.data;
};

export const editInterview = async (
  interviewID: string,
  interviewData: MockInterview
) => {
  const response = await apiClient.put(
    `${API_URL}/edit/${interviewID}`,
    interviewData
  );
  return response.data;
};

export const deleteInterview = async (interviewID: string) => {
  const response = await apiClient.delete(`${API_URL}/delete/${interviewID}`);
  return response.data;
};
