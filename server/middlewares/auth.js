const jwt=require("jsonwebtoken");
require("dotenv").config();
const user=require("../Models/User");
//auth
exports.auth=async(req,res,next)=>{
    try{
        //extract token
        const token=req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer","");
        //if token missing then return res
        if(!token){
            return res.status(401).json({
                success:false,
                message:"token is missing",
            })
        }
        //verify token
        try{
            const decode=jwt.verify(token,process.env.JWT_SECRET);
            console.log(decode);
            req.user=decode;
        }catch(error){
            //verifiction issue
            return res.status(401).json({
                success:false,
                message:"token is invalid",
            })
        }
        next();
    }catch(error){
        return res.status(401).json({
            success:false,
            message:"something went wrong while validating the token",
        })
    }
}
//isStudent
exports.isStudent=async(req,res,next)=>{
    try{
        if(req.user.accountType!=="Student"){
            return res.status(401).json({
            success:false,
            message:"protected route for student only",
        });
    }
        next();
    }catch(error){
        return res.status(401).json({
            success:false,
            message:"user role cannot  be verified,try again later",
        })
    }
}
//isInstructor
exports.isInstructor=async(req,res,next)=>{
    try{
        if(req.user.accountType!=="Instructor"){
            return res.status(401).json({
            success:false,
            message:"protected route for instrcutor only",
        });
    }
        next();
    }catch(error){
        return res.status(401).json({
            success:false,
            message:"user role cannot  be verified,try again later",
        })
    }
}
//isAdmin
exports.isAdmin=async(req,res,next)=>{
    try{
        if(req.user.accountType!=="Admin"){
            return res.status(401).json({
            success:false,
            message:"protected route for admin only",
        });
    }
        next();
    }catch(error){
        return res.status(401).json({
            success:false,
            message:"user role cannot  be verified,try again later",
        })
    }
}
