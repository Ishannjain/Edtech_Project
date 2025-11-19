const User=require("../Models/User");
const mailSender=require("../utils/mailSender");
const bcrypt=require("bcrypt");
//resetpassword token
exports.resetPassword=async(req,res)=>{
    try{
        //get emaiidationl from req body
        const email=req.body.email;
        //check user for this email,email validation
        const user=await User.findOne({email:email});
        if(!user){
            return res.status(401).json({
                success:false,
                message:"email is not registered",
            })
        }
        //generate token crypto library
        const token=crypto.randomUUID();
        //update user by adding token and expiration time
        const updatedDetails=await User.findOneAndUpdate({email:email},{
            token:token,
            resetPasswordExpires:Date.now() + 5*60*1000,
        },{
            new:true//updated return
        })
        //create url 
       
        const url=`https://localhost:3000/update-password/${token}`;
         //send mail containing url
         await mailSender(email,"Password Reset Link",`Password Reset Link ${url}`);
        //return response
        return res.json({
            success:true,
            message:"Link generate successfully,check your respective email",
        })
        
    }catch(error){
        return res.status(401).json({
            success:false,
            message:"something went wrong while link generation email",
        })
    }
}
//resetpassword
exports.resetPassword=async(req,res)=>{
    try{
        //data fetch
        const {password,confirmpassword,token}=req.body;
        //validation
        if(password!==confirmpassword){
            return res.status(401).json({
                success:false,
                message:error.message,
            })
        }
        //get username
        const userdetails=await User.findOne({token:token});
        // if no entry-invalid token
        if(!userdetails){
            return res.status(401).json({
                success:false,
                message:"invalid token",
            });
        }
        //token time check
        if(userdetails.resetPasswordExpires<Date.now()){
            return res.status(401).json({
                success:false,
                message:"token is expires,regenerate it again",
            })
        }
        //hash password
        const hashedPassword=await bcrypt.hash(password,10);
        //update password and return response
        await User.findOneAndUpdate({token:token},{password:hashedPassword},{new:true});
        return res.status(200).json({
            success:true,
            message:"password reset succesfully",
        })
    }catch(error){
         return res.status(401).json({
            success:false,
            message:"something went wrong while resetpassword email",
        })
    }
}