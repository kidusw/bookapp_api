import jwt from "jsonwebtoken";
import UserAuth from "../models/UserAuth.js";

const protectRoute = async(req,res,next)=>{
    try {
        const token= req.header("Authorization").replace("Bearer ","");
        if(!token) return res.status(401).json({message:"No authentication token, access denied"});

        //verify token

        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        const user = await UserAuth.findById(decoded.userId).select("-password");

        if(!user) return res.status(401).json({message:"Token not valid"});

        req.user=user;
        next();
    } catch (error) {
        res.status(401).json({messae:"Token is not valid"});
    }
}

export default protectRoute;