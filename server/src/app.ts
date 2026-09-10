import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

import express, { NextFunction, urlencoded } from "express";
import type { Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import router from "./routes";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import { swaggerDocs } from "./utils/swagger";
import { errorHandler } from "./middlewares/errorHandler";
import { BaseError, HttpStatusCode } from "./exceptions";

const app = express();
const port = process.env.PORT || 5000;

app.enable("trust proxy");
app.use(helmet());

// Allowed CORS origins
const allowedOrigins = [
  "http://localhost:5173", // Vite dev
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (curl, Postman, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    credentials: true,
  }),
);

app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(urlencoded({ limit: "10mb", extended: true }));

// Redirect root to docs
app.get("/", (req: Request, res: Response) => {
  res.redirect("/docs");
});

// Swagger docs
swaggerDocs(app, port);

// API routes
app.use("/api", router);

// 404 handler
app.use((req, res) => {
  if (!res.headersSent) {
    return res
      .status(HttpStatusCode.NOT_FOUND)
      .json({ status: "error", message: "Route not found" });
  }
});

// Central error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }

  errorHandler.handleError(err, res);

  if (!(err instanceof BaseError)) {
    res
      .status(HttpStatusCode.INTERNAL_SERVER)
      .json({ status: "error", message: "Internal server error" });
  }
});

export default app;
