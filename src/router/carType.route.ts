import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { createAttribute, deleteAttribute, getAttributeById, getAttributes, updateAttribute , getChildAttributes } from "../controllers/attribute.controller";
import { uploadIcon } from "../middleware/upload";
import { UserRole } from "../entities/user";
import { checkRole } from "../middleware/role.middleware";
import { createGovernorate, getAllGovernorates, getGovernorateByName } from "../controllers/governorate.controller";
import { createCarType, deleteCarType, getAllCarTypes, getCarTypeById, updateCarType } from "../controllers/CarType.controller";

const carTypeRouter: Router = Router();

carTypeRouter.post("/",
    authMiddleware,
    checkRole([UserRole.admin, UserRole.superAdmin , UserRole.user]),
    createCarType
);

carTypeRouter.get("/",
    getAllCarTypes
);

carTypeRouter.get("/:id",
    getCarTypeById
);


carTypeRouter.put("/:id",
    authMiddleware,
    checkRole([UserRole.admin, UserRole.superAdmin , UserRole.user]),
    updateCarType
);

carTypeRouter.delete("/:id",
    authMiddleware,
    checkRole([UserRole.admin, UserRole.superAdmin , UserRole.user]),
    deleteCarType
);





export default carTypeRouter;
