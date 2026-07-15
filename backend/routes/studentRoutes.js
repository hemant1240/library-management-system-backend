import express from "express";
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware.js";
import { searchStudentByRoll } from "../controllers/studentController.js";

const studentRouter = express.Router();

studentRouter.get("/search-by-roll", authenticateToken, authorizeRoles("admin"), searchStudentByRoll);

export default studentRouter;