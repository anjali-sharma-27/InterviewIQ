import type { AxiosResponse } from "axios";
import { MockInterview } from "@/vite-env";
import { apiClient, API_ROOT } from "./client";

const API_URL = `${API_ROOT}/ai`;

interface GenerateRequest {
  interviewID: string;
}

interface GenerateReviewRequest {
  InterviewDetailsObject: MockInterview;
}

export interface GeneratedQuestionsResponse {
  dsaQuestions: MockInterview["dsaQuestions"];
  coreSubjectQuestions: MockInterview["coreSubjectQuestions"];
  techStackQuestions: MockInterview["technicalQuestions"];
}

const inFlightByInterview = new Map<
  string,
  Promise<AxiosResponse<GeneratedQuestionsResponse>>
>();

export const generateQuestions = async (
  data: GenerateRequest
): Promise<AxiosResponse<GeneratedQuestionsResponse>> => {
  const key = data.interviewID;
  const existing = inFlightByInterview.get(key);
  if (existing) {
    return existing;
  }

  const request = apiClient
    .post<GeneratedQuestionsResponse>(`${API_URL}/generatequestions`, data)
    .finally(() => inFlightByInterview.delete(key));

  inFlightByInterview.set(key, request);
  return request;
};

export const generateReview = async (data: GenerateReviewRequest) => {
  return apiClient.post(`${API_URL}/generatereview`, data);
};
