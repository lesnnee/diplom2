import express from "express";
import {
    addCategory,
    addPriority,
    addRole,
    deleteCategory,
    deletePriority,
    deleteRole,
    getSettings
} from "../controllers/settings.controller.js";

const router = express.Router();

// settings
router.get("/", getSettings);

// roles
router.post("/roles", addRole);
router.delete("/roles/:role", deleteRole);

// categories
router.post("/categories", addCategory);
router.delete("/categories/:category", deleteCategory);

// priorities
router.post("/priorities", addPriority);
router.delete("/priorities/:priority", deletePriority);

export default router;