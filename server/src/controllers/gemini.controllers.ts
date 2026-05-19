import { Request, Response } from "express";
import { Question } from "../types/express";
import MockInterviewModel, { MockInterview } from "../models/mockinterview.model";
import {
  callGemini,
  getGeminiErrorStatus,
  parseGeminiJson,
} from "../utils/gemini";

const inFlightQuestionGeneration = new Map<
  string,
  Promise<{
    dsaQuestions: Question[];
    techStackQuestions: Question[];
    coreSubjectQuestions: Question[];
  }>
>();

type StoredQuestion = {
  question: string;
  answer?: string;
  review?: string;
  type?: string;
  technology?: string;
};

function hasExistingQuestions(interview: {
  dsaQuestions?: StoredQuestion[];
  technicalQuestions?: StoredQuestion[];
  coreSubjectQuestions?: StoredQuestion[];
}) {
  const dsa = interview.dsaQuestions?.length ?? 0;
  const tech = interview.technicalQuestions?.length ?? 0;
  const core = interview.coreSubjectQuestions?.length ?? 0;
  return dsa + tech + core > 0;
}

function normalizeQuestions(questions?: StoredQuestion[]): Question[] {
  return (questions ?? []).map((q) => ({
    type: (q.type ?? "Conceptual") as String,
    technology: (q.technology ?? "General") as String,
    question: q.question as String,
    answer: (q.answer ?? "") as String,
    review: (q.review ?? "") as String,
  }));
}

function extractAndParseJSONQuestion(responseText: string) {
  const parsedData = parseGeminiJson<{ questions?: Question[] }>(responseText);
  if (!parsedData) {
    console.error("Error parsing question JSON from Gemini");
    return null;
  }

  if (parsedData.questions && Array.isArray(parsedData.questions)) {
    parsedData.questions = parsedData.questions.map((question: Question) => ({
      ...question,
      answer: question.answer ?? "",
      review: question.review ?? "",
    }));
  }

  return parsedData;
}

function extractAndParseJSON(
  responseText: string
): MockInterview | null {
  return parseGeminiJson<MockInterview>(responseText);
}

const generateQuestions = async (
  category: string,
  interviewID: string,
  userId: string,
  skills: string[] = []
) => {
  const mockInterview = await MockInterviewModel.findOne({
    _id: interviewID,
    user: userId,
  });

  if (!mockInterview) {
    throw new Error("Mock interview not found");
  }

  const jobRole = mockInterview.jobRole;
  const experienceLevel = mockInterview.experienceLevel;
  const company = mockInterview.targetCompany;
  const techStack = skills.length ? skills : mockInterview.skills || [];

  if (!jobRole || !company || !experienceLevel) {
    throw new Error("All fields are required");
  }

  const prompt = `Generate a JSON response containing 10 detailed ${category} interview questions tailored to assess a candidate's skills and expertise based on the following criteria:

  Tech Stack: ${techStack.join(", ")}
  Experience Level: ${experienceLevel}
  Company: ${company}
  Job Role: ${jobRole}

  Question Types:
  - Conceptual Questions: Questions that test theoretical knowledge.
  - Scenario-Based Questions: Real-world scenarios that evaluate problem-solving abilities.

  Output Format:
  {
    "questions": [
      { "type": "Conceptual", "technology": "Node.js", "question": "Explain the event loop in Node.js and how it handles asynchronous operations." },
      { "type": "Scenario", "technology": "MongoDB", "question": "You need to optimize a MongoDB query for a large dataset. Describe your approach." }
    ]
  }

  Ensure the questions are relevant and aligned with the provided technologies. Use a balanced mix of difficulty levels appropriate for the experience level. Important: Return only the JSON format in your response with no extra text or explanations.`;

  try {
    const responseData = await callGemini(prompt);
    return extractAndParseJSONQuestion(responseData) || { questions: [] };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`Error generating ${category} questions:`, message);
    return { questions: [] };
  }
};

export const generateDSAQuestions = async (
  interviewID: string,
  userId: string
) => generateQuestions("DSA", interviewID, userId);

export const generateTechStackQuestions = async (
  interviewID: string,
  userId: string,
  skills: string[]
) => generateQuestions("Tech Stack", interviewID, userId, skills);

export const generateCoreSubjectQuestions = async (
  interviewID: string,
  userId: string
) =>
  generateQuestions("Core Subjects", interviewID, userId, [
    "OS",
    "OOPs",
    "System Design",
  ]);

async function fetchInterviewQuestions(
  userId: string,
  interviewID: string,
  skills?: string[]
) {
  const mockInterview = await MockInterviewModel.findOne({
    _id: interviewID,
    user: userId,
  });

  if (!mockInterview) {
    throw Object.assign(new Error("Mock interview not found"), { status: 404 });
  }

  if (hasExistingQuestions(mockInterview)) {
    return {
      dsaQuestions: normalizeQuestions(mockInterview.dsaQuestions),
      techStackQuestions: normalizeQuestions(mockInterview.technicalQuestions),
      coreSubjectQuestions: normalizeQuestions(
        mockInterview.coreSubjectQuestions
      ),
    };
  }

  const { jobRole, experienceLevel, targetCompany: company } = mockInterview;
  const techStack = skills?.length ? skills : mockInterview.skills || [];

  if (!jobRole || !company || !experienceLevel) {
    throw Object.assign(new Error("All interview fields are required"), {
      status: 400,
    });
  }

  const prompt = `Generate interview questions in three categories for this candidate.

Tech Stack: ${techStack.join(", ") || "general software engineering"}
Experience Level: ${experienceLevel}
Company: ${company}
Job Role: ${jobRole}

Requirements:
- "dsaQuestions": exactly 5 DSA questions (algorithms, data structures).
- "techStackQuestions": exactly 5 tech-stack questions (Conceptual or Scenario; include "technology").
- "coreSubjectQuestions": exactly 5 questions on OS, OOP, or System Design.

Each item: { "type": "Conceptual" | "Scenario", "technology": string, "question": string }

Return JSON only with keys: dsaQuestions, techStackQuestions, coreSubjectQuestions.`;

  const responseData = await callGemini(prompt, { jsonMode: true });
  const parsed = parseGeminiJson<{
    dsaQuestions?: StoredQuestion[];
    techStackQuestions?: StoredQuestion[];
    coreSubjectQuestions?: StoredQuestion[];
  }>(responseData);

  const dsa = normalizeQuestions(parsed?.dsaQuestions);
  const tech = normalizeQuestions(parsed?.techStackQuestions);
  const core = normalizeQuestions(parsed?.coreSubjectQuestions);

  if (dsa.length + tech.length + core.length === 0) {
    throw Object.assign(
      new Error(
        "Could not parse interview questions from Gemini. Try again or check GEMINI_MODEL in server/.env."
      ),
      { status: 503 }
    );
  }

  return {
    dsaQuestions: dsa,
    techStackQuestions: tech,
    coreSubjectQuestions: core,
  };
}

export const GenerateIntervieQuestions = async (
  req: Request,
  res: Response
) => {
  const { interviewID, skills } = req.body as {
    interviewID: string;
    skills?: string[];
  };
  const userId = req.user._id;

  if (!interviewID) {
    return res.status(400).json({ error: "Interview ID is required" });
  }

  const cacheKey = `${userId}:${interviewID}`;
  let pending = inFlightQuestionGeneration.get(cacheKey);
  if (!pending) {
    pending = fetchInterviewQuestions(userId, interviewID, skills);
    inFlightQuestionGeneration.set(cacheKey, pending);
    pending.finally(() => inFlightQuestionGeneration.delete(cacheKey));
  }

  try {
    const result = await pending;
    return res.status(200).json(result);
  } catch (error: unknown) {
    const status =
      getGeminiErrorStatus(error) ??
      (error as { status?: number }).status;
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error generating interview questions:", message);

    if (status === 404) {
      return res.status(404).json({ error: message });
    }

    if (status === 400) {
      return res.status(400).json({ error: message });
    }

    if (status === 503) {
      return res.status(503).json({ error: message });
    }

    if (status === 429) {
      return res.status(429).json({
        error:
          "Gemini API rate limit reached. Wait a minute and try again, or check quota at https://aistudio.google.com/apikey",
      });
    }

    if (status === 401 || status === 403) {
      return res.status(503).json({
        error: "Invalid or unauthorized GEMINI_API_KEY in server/.env.",
      });
    }

    if (message.includes("GEMINI_API_KEY is not configured")) {
      return res.status(503).json({
        error: "GEMINI_API_KEY is missing in server/.env.",
      });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
};

export const GenerateReview = async (req: Request, res: Response) => {
  const { InterviewDetailsObject } = req.body as {
    InterviewDetailsObject: MockInterview;
  };

  if (!InterviewDetailsObject) {
    return res.status(400).json({ message: "Invalid request format" });
  }

  const reviewPrompt = `
  You are an AI designed to evaluate technical interview responses. Given an interview object in JSON format, your task is to analyze the provided answers and generate the following:

  - Review for each question – Provide constructive feedback on the answer's correctness, completeness, and clarity. If an answer is missing, note that it needs to be filled.
  - Overall Rating – Assign a rating (on a scale from 1 to 5) based on the accuracy and depth of the provided answers.
  - Unchanged Structure – Maintain the original JSON structure, only updating the review fields for each question and setting the overallRating.
  - JSON-Only Output – Your response must contain only the updated JSON object and no additional text or explanation.

  InterviewDetails:
  ${JSON.stringify(InterviewDetailsObject)}
`;

  try {
    const responseData = await callGemini(reviewPrompt, { jsonMode: true });
    const generatedResponse = extractAndParseJSON(responseData);

    if (!generatedResponse) {
      return res.status(500).json({ error: "Failed to parse AI review" });
    }

    const interview = await MockInterviewModel.findById(
      InterviewDetailsObject._id
    );

    if (!interview) {
      return res.status(404).json({ error: "Interview not found" });
    }

    interview.dsaQuestions = generatedResponse.dsaQuestions;
    interview.technicalQuestions = generatedResponse.technicalQuestions;
    interview.coreSubjectQuestions = generatedResponse.coreSubjectQuestions;
    interview.overallRating = generatedResponse.overallRating;
    interview.overallReview = generatedResponse.overallReview;
    await interview.save();

    return res.status(200).json({ message: "success" });
  } catch (error: unknown) {
    const status = getGeminiErrorStatus(error) ?? 500;
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error generating review:", message);

    if (status === 429) {
      return res.status(429).json({ error: message });
    }

    if (status === 401 || status === 403) {
      return res.status(503).json({
        error: "Invalid or unauthorized GEMINI_API_KEY in server/.env.",
      });
    }

    if (message.includes("GEMINI_API_KEY")) {
      return res.status(503).json({ error: message });
    }

    return res.status(status >= 400 && status < 600 ? status : 500).json({
      error: status === 500 ? "Internal server error" : message,
    });
  }
};
