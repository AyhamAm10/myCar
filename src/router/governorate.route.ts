import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { createAttribute, deleteAttribute, getAttributeById, getAttributes, updateAttribute , getChildAttributes } from "../controllers/attribute.controller";
import { uploadIcon } from "../middleware/upload";
import { UserRole } from "../entities/user";
import { checkRole } from "../middleware/role.middleware";
import { createGovernorate, getAllGovernorates, getGovernorateByName } from "../controllers/governorate.controller";

const governorateRouter: Router = Router();

governorateRouter.post("/",
    authMiddleware,
    checkRole([UserRole.admin, UserRole.superAdmin]),
    createGovernorate
);

governorateRouter.get("/",
    getAllGovernorates
);

governorateRouter.get("/:name",
    getGovernorateByName
);


governorateRouter.put("/:name",
    authMiddleware,
    checkRole([UserRole.admin, UserRole.superAdmin]),
    getGovernorateByName
);

governorateRouter.delete("/:name",
    authMiddleware,
    checkRole([UserRole.admin, UserRole.superAdmin]),
    getGovernorateByName
);





export default governorateRouter;
