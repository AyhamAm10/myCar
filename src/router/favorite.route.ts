// routes/favorite.ts
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { checkRole } from "../middleware/role.middleware";
import { UserRole } from "../entities/user";
import { favoriteController } from "../controllers/favorite.controller";


const favoriteRoute = Router();

favoriteRoute.get("/" , 
    authMiddleware,
    checkRole([UserRole.admin , UserRole.superAdmin , UserRole.user]),
    favoriteController.getFavorites.bind(favoriteController)
);

favoriteRoute.post("/toggle" , 
    authMiddleware,
    checkRole([UserRole.admin , UserRole.superAdmin , UserRole.user]),
    favoriteController.toggleFavorite.bind(favoriteController)
);


export default favoriteRoute;
