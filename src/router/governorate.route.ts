import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { UserRole } from "../entities/user";
import { checkRole } from "../middleware/role.middleware";
import { createGovernorate, deleteGovernorate, getAllGovernorates, getGovernorateById, updateGovernorate } from "../controllers/governorate.controller";

const governorateRouter: Router = Router();

governorateRouter.post("/",
    authMiddleware,
    checkRole([UserRole.admin, UserRole.superAdmin]),
    createGovernorate
);

governorateRouter.get("/",
    getAllGovernorates
);

governorateRouter.get("/:id",
    getGovernorateById
);


governorateRouter.put("/:id",
    authMiddleware,
    checkRole([UserRole.admin, UserRole.superAdmin]),
    updateGovernorate
);

governorateRouter.delete("/:id",
    authMiddleware,
    checkRole([UserRole.admin, UserRole.superAdmin]),
    deleteGovernorate
);





export default governorateRouter;
