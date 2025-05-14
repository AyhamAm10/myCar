import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { UserRole } from "../entities/user";
import { checkRole } from "../middleware/role.middleware";
import { createCar, deleteCar, getAllCars, getCarById, updateCar } from "../controllers/Car.controller";

const carRoute: Router = Router();

carRoute.post("/",
    authMiddleware,
    checkRole([UserRole.user , UserRole.admin, UserRole.superAdmin]),
    createCar
);

carRoute.get("/",
    getAllCars
);

carRoute.get("/:id",
    getCarById
);


carRoute.put("/:id",
    authMiddleware,
    checkRole([UserRole.user , UserRole.admin, UserRole.superAdmin]),
    updateCar
);

carRoute.delete("/:id",
    authMiddleware,
    checkRole([UserRole.user , UserRole.admin, UserRole.superAdmin]),
    deleteCar
);

export default carRoute;