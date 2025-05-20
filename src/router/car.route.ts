import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { UserRole } from "../entities/user";
import { checkRole } from "../middleware/role.middleware";
import { createCar, deleteCar, getAllCars, getCarById, updateCar } from "../controllers/Car.controller";
import { upload } from "../middleware/upload";
import { CarSearchController } from "../controllers/search.controller";

const carRoute: Router = Router();
const searchClass = new CarSearchController

carRoute.post("/",
    authMiddleware,
    checkRole([UserRole.user , UserRole.admin, UserRole.superAdmin]),
    upload.array("image"),
    createCar
);

carRoute.post("/search",
    authMiddleware,
    checkRole([UserRole.user , UserRole.admin, UserRole.superAdmin]),
    searchClass.search
);

carRoute.get("/",
    authMiddleware,
    checkRole([UserRole.user , UserRole.admin, UserRole.superAdmin]),
    getAllCars
);

carRoute.get("/:id",
    authMiddleware,
    checkRole([UserRole.user , UserRole.admin, UserRole.superAdmin]),
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