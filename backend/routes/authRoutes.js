import express from "express";
import { completeProfile, registerUser, verifyOtp, loginUser,registerAdmin, getProfile, updateProfile, getUser} from "../controllers/authControllers.js";
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware.js";


const authRouter = express.Router();

authRouter.post("/register", registerUser);
authRouter.post("/verify-otp", verifyOtp);
authRouter.post("/complete-profile", completeProfile);

authRouter.post("/login", loginUser);
authRouter.post("/register-admin", registerAdmin);

//Protected routes 

authRouter.get("/me", authenticateToken, getProfile);
authRouter.put("update-profile",authenticateToken, updateProfile);

authRouter.get("/user",authenticateToken, authorizeRoles("admin"), getUser);

export default authRouter;
