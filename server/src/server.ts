import "./loadEnv";
import http from "http";
import app from "./app";
import serverless from "serverless-http";

const port = Number(process.env.PORT) || 5000;

const httpServer = http.createServer(app);

httpServer.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `Port ${port} is already in use. Stop the other server (Ctrl+C), then run: npm run free-port`
    );
    process.exit(1);
  }
  throw err;
});

process.on("unhandledRejection", (reason) => {
  console.error(
    "[unhandledRejection]",
    reason instanceof Error ? reason.message : reason
  );
});

httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports.handler = serverless(app);
export default app;
