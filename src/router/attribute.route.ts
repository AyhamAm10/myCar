import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { createAttribute, deleteAttribute, getAttributeById, getAttributes, updateAttribute , getChildAttributes, getAttributesForEditCar } from "../controllers/attribute.controller";
import { uploadIcon } from "../middleware/upload";
import { checkRole } from "../middleware/role.middleware";
import { UserRole } from "../entities/user";

const attributeRouter: Router = Router();

attributeRouter.post("/",
    authMiddleware,
    checkRole([UserRole.superAdmin]),
    uploadIcon.single("icon"),
    createAttribute
);

attributeRouter.get("/", 
    authMiddleware,
    checkRole([ UserRole.user, UserRole.admin, UserRole.superAdmin]),
    getAttributes
);

attributeRouter.get("/all", 
    // authMiddleware,
    // checkRole([ UserRole.user, UserRole.admin, UserRole.superAdmin]),
    getAttributesForEditCar
);

attributeRouter.post("/:parentId/children", 
    getChildAttributes
);

attributeRouter.get("/:id", 
    authMiddleware,
    checkRole([ UserRole.user, UserRole.admin, UserRole.superAdmin]),
    getAttributeById
);

attributeRouter.put("/:id", 
    authMiddleware,
    checkRole([  UserRole.superAdmin]),
    uploadIcon.single("icon"),
    updateAttribute
);

attributeRouter.delete("/:id", 
    authMiddleware,
    checkRole([  UserRole.superAdmin]),
    deleteAttribute
);

export default attributeRouter;
