import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { ProfileController } from '../controllers/profile.controller';
import { checkRole } from '../middleware/role.middleware';
import { UserRole } from '../entities/user';
import { upload } from '../middleware/upload';

const profileController = new ProfileController();

export const profileRouter = Router();

profileRouter.put("/", 
    authMiddleware,
    checkRole([UserRole.admin , UserRole.superAdmin , UserRole.user]),
    upload.single('image'),
    (req, res, next) => {
    profileController.updateProfile(req, res, next)
  });