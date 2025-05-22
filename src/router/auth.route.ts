import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const authController = new AuthController();

export const authRouter = Router();

authRouter.post("/register", (req, res, next) => {
    authController.register(req, res, next);
  });

  authRouter.post("/login", (req, res, next) => {
    authController.login(req, res, next);
  });

  authRouter.post("/logout", (req, res, next) => {
    authController.logout(req, res, next);
  });

  authRouter.post("/reset/password", 
    authMiddleware,
    (req, res, next) => {
      AuthController.changePassword(req, res, next)
    }
  );

  authRouter.post("/me", authMiddleware, (req, res, next) => {
    authController.getCurrentUser(req, res, next);
  });