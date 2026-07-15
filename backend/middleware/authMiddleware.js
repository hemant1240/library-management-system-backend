import User from "../models/User.js";
import jwt from "jsonwebtoken";

//to authenticate jwt token 

export const authenticateToken = async (req , res, next)=> {
     try {
        
        const authHeader= req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
    
        if(!token){
            return res.status(400).json({
                message:"No token provided , authorization denied "
            });
        }

        const decoded = jwt.verify(token , process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).Select("-password");

        if(!user){
            return res.status(401).json({message:" Token is not valid or user no longer exist"});
        }

        req.user =user;
        next();
     } 
     
     catch (error) {
        console.error("jwt auth error", error);
        return res.status(400).json({
            message:"Token is not valid"
        });
     }
}


// middleware to authorize specific roles

export const authorizeRoles = (...roles) =>{
     return ( req , res, next) =>{
        if(!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: " Access is forbidden"
            });
        }

        next();
     }
}