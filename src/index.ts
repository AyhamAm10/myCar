import express, { ErrorRequestHandler } from "express";
import dotenv from "dotenv";
import cors from "cors";
import * as path from "path";
import cookieParser from "cookie-parser";
import { errorHandler } from "./common/errors/error.handler";
import { Environment } from "./environment";
import { logger } from "./logging/logger";
import { AppDataSource } from "./config/data_source";
import { authRouter } from "./router/auth.route";
import { createSuperAdmin } from "./config/create-super-admin";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: "http://localhost:8800",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.use(cookieParser());
const router = express.Router();
router.get("/", (req, res) => {
  res.send("Our awesome Web API is online!");
});

router.use("/auth", authRouter);
app.use(process.env.BASE_URL ?? "/", router);

app.use(errorHandler );

const PORT = Number(process.env.PORT);

logger.info(`NODE_ENV: ${Environment.toString()}`);

if (Environment.isDevelopment() || Environment.isProduction()) {
  AppDataSource.initialize()
    .then(async (connection) => {
      logger.info(
        `Database connection status: ${
          connection.isInitialized ? "Connected" : "Not Connected"
        }`
      );

      try {
        await createSuperAdmin();
      } catch (error) {
        logger.error("Failed to create super admin:", error);
      }

      app.listen(PORT, "0.0.0.0", () => {
        logger.info(`Server running at http://localhost:${PORT}`);
      });
    })
    .catch((error: Error) => {
      logger.error(error);
    });
}

export { app };
