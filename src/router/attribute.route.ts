import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { createAttribute, deleteAttribute, getAttributeById, getAttributes, updateAttribute , getChildAttributes } from "../controllers/attribute.controller";
import { uploadIcon } from "../middleware/upload";

const attributeRouter: Router = Router();

attributeRouter.post("/",
    // authMiddleware,
    // checkRole([UserRole.vendor, UserRole.user, UserRole.admin, UserRole.superAdmin]),
    uploadIcon.single("icon"),
    createAttribute
);

attributeRouter.get("/", 
    // authMiddleware,
    // checkRole([UserRole.vendor, UserRole.user, UserRole.admin, UserRole.superAdmin]),
    getAttributes
);

attributeRouter.post("/:parentId/children", 
    getChildAttributes
);

attributeRouter.get("/:id", 
    // authMiddleware,
    // checkRole([UserRole.vendor, UserRole.user, UserRole.admin, UserRole.superAdmin]),
    getAttributeById
);

attributeRouter.put("/:id", 
    // authMiddleware,
    // checkRole([UserRole.vendor]),
    uploadIcon.single("icon"),
    updateAttribute
);

attributeRouter.delete("/:id", 
    // authMiddleware,
    // checkRole([UserRole.superAdmin]),
    deleteAttribute
);

export default attributeRouter;
