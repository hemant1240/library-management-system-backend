import express from "express";
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware.js";
import  { applyFine, getFineSetting, getIssues, getStudentIssue, returnBook, issueManualBooks, clearFine, updateFineSetting } from "../controllers/bookcontroller.js";
import fineSetting from "../models/fineSetting.js";

const bookRouter = express.Router();

bookRouter.get("/fine-setting", authenticateToken , getFineSetting);
bookRouter.get("/issues/student", authenticateToken , authorizeRoles("user"), getStudentIssue);


//admin 
 
bookRouter.get("issues", authenticateToken, authorizeRoles("admin"), getIssues);
bookRouter.post("issues-manual", authenticateToken, authorizeRoles("admin"), issueManualBooks);

bookRouter.put("/issue/:id/return" , authenticateToken , authorizeRoles("admin"), returnBook);
bookRouter.put("/issue/:id/fine" , authenticateToken , authorizeRoles("admin"), applyFine);

bookRouter.put("/issue/:id/clear-fine" , authenticateToken , authorizeRoles("admin"), clearFine);
bookRouter.put("/fine-setting" , authenticateToken , authorizeRoles("admin"), updateFineSetting);


export default bookRouter;
