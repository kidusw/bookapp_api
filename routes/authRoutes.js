import express from "express"
import UserAuth from "../models/UserAuth.js";
import jwt from "jsonwebtoken"; 

const router = express.Router();

const generateToke = (userId)=>{
    return jwt.sign({userId},process.env.JWT_SECRET,{expiresIn:"15d"});

}

router.post("/register",async(req,res)=>{
    try {
        const {email,username,password}=req.body;
        if(!username || !email || !password)
        {
            return res.status(404).json({message:"All fileds are required"});
        }
        if(password.length <6){
            return res.status(400).json({message:"password should be at least 6 chatacters"})
        }
        if(username.length < 3)
        {
            return res.status(400).json({message:"username should be 3 or more characters"});
        }
            // check user exists

    //    const existinguser= await UserAuth.findOne({$or:[{email},{username}]});
    //     if(existinguser) return res.status(400).json({})
    const existingEmail= await UserAuth.findOne({email});
    if(existingEmail){
        return res.status(400).json({message:"Email already exists"});
    }
     const existingUser= await UserAuth.findOne({username});
    if(existingUser){
        return res.status(400).json({message:"username already exists"});
    }
    //get random avatar

    const profileImage = `https://api.dicebear.com/9.x/avataaars/svg?seed=${username}`;

    const user = new UserAuth({
        email,
        username,
        password,
        profileImage
    })
    await user.save();

    const token = generateToke(user._id);
    res.status(201).json({message:"user created",token,user:{
        id:user._id,
        username:user.username,
        email:user.email,
        profileImage:user.profileImage,
        createdAt:user.createdAt
    }})
    } catch (error) {
        res.status(500).json({message:"Inernal server error"})
    }
})


router.post("/login",async(req,res)=>{
    try {
        const {email,password} = req.body;
        if(!email || !password) return res.status(400).json({message:"All fields are required"})
         // check if user exists
        const user = await UserAuth.findOne({email});
        if(!user) return res.status(400).json({message:"user doesnot exist"});
        const isPasswordCorrect = await user.comparePassword(password);
        if(!isPasswordCorrect) return res.status(400).json({message:"Invalid credentials"}) 

       const token = generateToke(user._id);
        res.status(200).json({message:"logged in",token,user:{
        id:user._id,
        username:user.username,
        email:user.email,
        profileImage:user.profileImage,
        createdAt:user.createdAt
    }})
    } catch (error) {
        res.status(500).json({message:"Inernal server error"})
    }
})

export default router;