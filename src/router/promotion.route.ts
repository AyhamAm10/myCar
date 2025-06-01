import { Router } from "express";
import { PromotionRequestController } from "../controllers/promotionRequest.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { checkRole } from "../middleware/role.middleware";
import { UserRole } from "../entities/user";

const PromotionRoute = Router();

PromotionRoute.post(
  "/account-verification",
  authMiddleware,
  checkRole([UserRole.user]),
  PromotionRequestController.createAccountVerificationRequest.bind(PromotionRequestController)
);

PromotionRoute.post(
  "/listing-promotion",
  authMiddleware,
  checkRole([UserRole.user , UserRole.superAdmin]),
  PromotionRequestController.createListingPromotionRequest.bind(PromotionRequestController)
);

PromotionRoute.get(
  "/",
  authMiddleware,
  checkRole([UserRole.superAdmin , UserRole.admin]),
  PromotionRequestController.getAllRequests.bind(PromotionRequestController)
);


PromotionRoute.patch(
  "/:id/status",
  authMiddleware,
  checkRole([UserRole.superAdmin , UserRole.admin]),
  PromotionRequestController.updateRequestStatus.bind(PromotionRequestController)
);

PromotionRoute.delete(
  "/:id",
  authMiddleware,
  checkRole([UserRole.superAdmin , UserRole.admin]),
  PromotionRequestController.deleteRequest.bind(PromotionRequestController)
);

export default PromotionRoute;
