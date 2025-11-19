const User=require("../Models/User");
const OTP=require("../Models/OTP");
const otpgenerator=require("otp-generator");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
//sendotp
exports.sendOTP=async(req,res)=>{
    try{
    //fetch email from the user body
    const {email}=req.body;
    //check is user exist or not
    const checkuserpresent=await User.findOne({email});
    if(checkuserpresent){
        return res.status(401).json({
            success:false,
            message:"User already exits",
        })
    }
    //generate otp npm i otp-generator -.brute force use random otp genrator (use package)
    var otp=otpgenerator.generate(6,{
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false,
    });
    console.log("otp generated",otp);
    //otp must be unique
    const result=await OTP.findOne({otp:otp});
    while(result){
        otp=otpgenerator.generate(6,{
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false,
        });
    }
    const otppayload={email,otp};
    //create an entry in db for otp
    const otpBody=await OTP.create(otppayload);
    console.log(otpBody);
    res.status(200).json({
        success:true,
        message:'OTP sent succesfully',
        otp,
    })
}   
catch(err){
    res.status(500).json({
        success:false,
        message:err.message,
        
    })
}
};
//signup
exports.signup=async(req,res)=>{
    try{
    //data fetch from req
    const {firstName,lastName,email,password,
        confirmpassword,accountType,otp,ContactNumber}=req.body;
    //validate user
    if(!firstName||!lastName|| !email ||!password ||!confirmpassword|| !otp){
        return res.status(403).json({
            success:false,
            message:"All fields required",
        })
    }
    //check password
    if(password!==confirmpassword){
         return res.status(400).json({
            success:false,
            message:"password and confirmpassword not matched please try again later",
        })
    }
    //check if user exist or not
    const userexist=await  User.findOne({email});
    if(userexist){
        return res.status(400).json({
             success:false,
            message:"user is already exists",
        })
    }
    //find most recent otp stored for the user
    const recentotp=(await OTP.find({email})).sort({createdAt:-1}).limit(1);
    console.log(recentotp);
    // validate otps
    if(recentotp.length===0){
          return res.status(400).json({
             success:false,
            message:"user is already exists",
        })
    }else if(otp!==recentotp.otp){
        return res.status(400).json({
             success:false,
            message:"invalid otp",
        })
    }
    //hash the password
    const  hashedPassword=await bcrypt.hash(password,10);
    //create an entry inside the db
    const ProfileDetails=await Profile.create({
        gender:null,
        DOB:null,
        about:null,
        contachNumber:null,
    });
    const user=await User.create({
        firstName,
        lastName,
        email,
        ContactNumber,
        password:hashedPassword,
        accountType,
        additionalDetails:ProfileDetails._id,
        //dicebear api icons
        images:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName}${lastName}`,
    })

    return res.status(200).json({
            success:true,
            message:"User Registered Successfullly",
            user,
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"user cannot be registered please try again",
        })
    }
};

//login
exports.login=async(req,res)=>{
    try{
        //  fetch email and password from body
        const {email,password}=req.body;
        //check user exist or not
        
            if(!email ||!password){
                return res.status(403).json({
                    success:false,
                    message:"all fields required",
                })
            }
            const user=await User.findOne({email}).populate("additionalDetails");
            if(!user){
                 return res.status(401).json({
                    success:false,
                    message:"user is not registered,please signup first",
                })
            }

            //match password and generate jwt authetication 
            if(await bcrypt.compare(password,user.password)){
            const payload={
                    email:user.email,
                    id:user._id,
                    accountType:user.accountType,
                }
            const token=jwt.sign(payload,process.env.JWT_SECRET,{
                    expiresIn:"2h",
                });
                user.token=token;
                user.password=undefined;
            
            const options={
                expiresIn:new Date(Date.now()+3*24*60*60*100),
                httpOnly:true,
            }
            //create cookie and send response
            res.cookie("token",token,options).status(200).json({
                success:true,
                token,
                user,
                message:"Logged in Successfully",
            })
            }
            else{
                 return res.status(401).json({
                    success:false,
                    message:"password is incorrect",
                })
            }
        
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to Login please try again later",
        })
    }
}
//changepassword
exports.changePassword=async(req,res)=>{
    try{
        //  fetch data from req body
        const {email,password,oldpassword,newpassword,confirmpassword}=req.body;
        //get oldPassword,newPassword,confirmPassword
        if(!email||!password ||!oldpassword ||!newpassword ||!confirmpassword){
                return res.status(403).json({
                    success:false,
                    message:"all fields required",
                })
            }
        const user=await User.findOne({email});
            if (!user) {
                return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        
        //validation
        if(newpassword!==confirmpassword){
            return res.status(400).json({
                     success: false,
                     message: "new password and confirmpassword should matched",
             });
        }
        const ispasswordmatched=await bcrypt.compare(oldpassword,user.password);
        if (!ispasswordmatched) {
                return res.status(401).json({
                success: false,
                message: "Old password is incorrect",
        });
        }
        //update password in db
        const hashedPassword=await bcrypt.hash(newpassword,10);
        user.password=hashedPassword;
        await user.save();
        //send mail -Password updated

        //return response
        return res.status(200).json({
                success: true,
                message: "Password changed successfully",
        });
        
      }catch(error){
     return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}
