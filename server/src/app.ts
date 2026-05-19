import "./loadEnv";
import express, { ErrorRequestHandler } from "express";
import cors from "cors";
import connectDB from "./database/database";
import userRoutes from "./routes/user.routes";
import mockinterviewRoutes from "./routes/mockinterview.routes";
import geminiRoutes from "./routes/gemini.routes";
import healthRoutes from "./routes/health.routes";
import cookieParser from "cookie-parser";
import { getGeminiErrorStatus } from "./utils/gemini";

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
].filter(Boolean) as string[];

const isDev = process.env.NODE_ENV !== "production";

/** Vite may use 5174+ when 5173 is taken — allow any localhost port in dev. */
const isLocalDevOrigin = (origin: string): boolean =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

const isAllowedOrigin = (origin: string): boolean =>
  allowedOrigins.includes(origin) || (isDev && isLocalDevOrigin(origin));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || isAllowedOrigin(origin)) {
        callback(null, origin ?? true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

connectDB();

app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "Interview IQ API" });
});

app.use("/api/users", userRoutes);
app.use("/api/mockinterview", mockinterviewRoutes);
app.use("/api/ai", geminiRoutes);
app.use("/api/health", healthRoutes);

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const message = err instanceof Error ? err.message : "Internal server error";

  if (message === "Not allowed by CORS") {
    res.status(403).json({ error: "Origin not allowed by CORS" });
    return;
  }

  const status = getGeminiErrorStatus(err) ?? 500;
  const safeStatus = status >= 400 && status < 600 ? status : 500;

  console.error(`[API error] ${message}`);

  if (res.headersSent) {
    return;
  }

  if (safeStatus === 429) {
    res.status(429).json({
      error:
        message ||
        "Gemini API rate limit reached. Wait a minute and try again, or check quota at https://aistudio.google.com/apikey",
    });
    return;
  }

  if (safeStatus === 401 || safeStatus === 403) {
    res.status(503).json({
      error: "Invalid or unauthorized GEMINI_API_KEY in server/.env.",
    });
    return;
  }

  res.status(safeStatus).json({
    error: safeStatus === 500 ? "Internal server error" : message,
  });
};

app.use(errorHandler);

export default app;
