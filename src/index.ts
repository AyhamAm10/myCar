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
import { swaggerDoc } from "./helper/swaggerOptions";
import { profileRouter } from "./router/profile.route";
import attributeRouter from "./router/attribute.route";
import governorateRouter from "./router/governorate.route";
import carTypeRouter from "./router/carType.route";
import carRoute from "./router/car.route";
import favoriteRoute from "./router/favorite.route";

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
router.use("/profile", profileRouter);
router.use("/attributes", attributeRouter);
router.use("/governorates", governorateRouter);
router.use("/car-types", carTypeRouter);
router.use("/car", carRoute);
router.use("/favorites", favoriteRoute);

app.use(process.env.BASE_URL ?? "/", router);

app.use(errorHandler );

const PORT = Number(process.env.PORT);

swaggerDoc(app);

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
