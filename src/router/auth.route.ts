import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { sendOtp, verifyOtp } from '../controllers/OTP-verify.controller';

const authController = new AuthController();

export const authRouter = Router();

authRouter.post("/register", (req, res, next) => {
    authController.register(req, res, next);
  });

  authRouter.post("/login", (req, res, next) => {
    authController.login(req, res, next);
  });

  authRouter.post("/send-otp", (req, res, next) => {
    sendOtp(req, res, next);
  });

  authRouter.post("/verify-otp", (req, res, next) => {
    verifyOtp(req, res, next);
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

  authRouter.post("/forgit/password", 
    // authMiddleware,
    (req, res, next) => {
      AuthController.resetPassword(req, res, next)
    }
  );

  authRouter.post("/me", authMiddleware, (req, res, next) => {
    authController.getCurrentUser(req, res, next);
  });