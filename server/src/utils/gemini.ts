import axios, { isAxiosError } from "axios";

/** Models tried in order when the primary model is unavailable or rate-limited. */
const GEMINI_MODEL_FALLBACKS = [
  "gemini-1.5-flash-latest",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
];

const MAX_RETRIES = 2;
const RETRYABLE_STATUSES = new Set([429, 503]);

export const GEMINI_MODEL =
  process.env.GEMINI_MODEL?.trim() || GEMINI_MODEL_FALLBACKS[0];

export class GeminiApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "GeminiApiError";
    this.status = status;
  }
}

function geminiUrl(model: string) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function geminiErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { error?: { message?: string } } | undefined;
    if (data?.error?.message) {
      return data.error.message.split("\n")[0] ?? data.error.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Gemini request failed";
}

function retryDelayMs(attempt: number, error?: unknown): number {
  if (isAxiosError(error)) {
    const retryAfter = error.response?.headers?.["retry-after"];
    if (typeof retryAfter === "string") {
      const seconds = Number.parseInt(retryAfter, 10);
      if (!Number.isNaN(seconds) && seconds > 0) {
        return seconds * 1000;
      }
    }

    const details = (
      error.response?.data as { error?: { details?: Array<Record<string, unknown>> } }
    )?.error?.details;
    if (Array.isArray(details)) {
      const retryInfo = details.find((d) =>
        String(d["@type"] ?? "").includes("RetryInfo")
      );
      const retryDelay = retryInfo?.retryDelay;
      if (typeof retryDelay === "string") {
        const seconds = Number.parseFloat(retryDelay);
        if (!Number.isNaN(seconds) && seconds > 0) {
          return Math.ceil(seconds * 1000);
        }
      }
    }
  }
  return Math.min(5000 * 2 ** attempt, 60000);
}

function shouldTryNextModel(status: number | undefined): boolean {
  return status === 404 || status === 429 || status === 503;
}

export interface CallGeminiOptions {
  /** Ask Gemini to return valid JSON (recommended for structured prompts). */
  jsonMode?: boolean;
}

export function getGeminiErrorStatus(error: unknown): number | undefined {
  if (error instanceof GeminiApiError) {
    return error.status;
  }
  if (isAxiosError(error)) {
    return error.response?.status;
  }
  return (error as { status?: number }).status;
}

export async function callGemini(
  prompt: string,
  options: CallGeminiOptions = {}
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiApiError("GEMINI_API_KEY is not configured", 503);
  }

  const modelsToTry = [
    GEMINI_MODEL,
    ...GEMINI_MODEL_FALLBACKS.filter((m) => m !== GEMINI_MODEL),
  ];

  let lastError: unknown;
  let lastStatus = 503;

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const body: Record<string, unknown> = {
          contents: [{ parts: [{ text: prompt }] }],
        };
        if (options.jsonMode) {
          body.generationConfig = { responseMimeType: "application/json" };
        }

        const response = await axios.post(geminiUrl(model), body, {
          headers: { "Content-Type": "application/json" },
          params: { key: apiKey },
          timeout: 90000,
        });

        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          throw new GeminiApiError("Empty response from Gemini API", 502);
        }
        if (model !== GEMINI_MODEL) {
          console.warn(`Gemini: using fallback model "${model}"`);
        }
        return text;
      } catch (error) {
        if (error instanceof GeminiApiError && error.status !== 429 && error.status !== 503) {
          throw error;
        }

        lastError = error;
        const status = getGeminiErrorStatus(error);
        if (status !== undefined) {
          lastStatus = status;
        }

        if (status === 401 || status === 403) {
          throw new GeminiApiError(
            "Invalid or unauthorized GEMINI_API_KEY in server/.env.",
            status
          );
        }

        const isRetryable =
          status !== undefined && RETRYABLE_STATUSES.has(status);
        if (isRetryable && attempt < MAX_RETRIES) {
          const delay = retryDelayMs(attempt, error);
          console.warn(
            `Gemini "${model}" rate limited (${status}), retry ${attempt + 1}/${MAX_RETRIES} in ${delay}ms…`
          );
          await sleep(delay);
          continue;
        }

        if (shouldTryNextModel(status)) {
          console.warn(
            `Gemini model "${model}" unavailable (${status ?? "error"}), trying next…`
          );
          break;
        }

        throw new GeminiApiError(geminiErrorMessage(error), status ?? 502);
      }
    }
  }

  const detail = geminiErrorMessage(lastError);
  if (lastStatus === 429) {
    throw new GeminiApiError(
      "Gemini API rate limit reached on all models. Wait a minute and try again, or set GEMINI_MODEL in server/.env (e.g. gemini-1.5-flash-latest).",
      429
    );
  }

  throw new GeminiApiError(
    `No available Gemini model. Set GEMINI_MODEL in server/.env or verify GEMINI_API_KEY. (${detail})`,
    lastStatus
  );
}

export function parseGeminiJson<T>(responseText: string): T | null {
  try {
    const jsonString = responseText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error("Error parsing Gemini JSON:", error);
    return null;
  }
}
