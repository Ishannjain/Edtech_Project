const express=require("express");
const router=express.Router();
const {auth}=require("../middlewares/auth");
const{
    deleteAccount,
    updateProfile,
    getAllUserDeatils,
    updateDisplayPicture,
    getEnrolledCourses,
}=require("../controllers.Profile");

// profile routes

//delete user account

router.delete("/deleteProfile",deleteAccount);
router.put("/updateProfile",auth,updateProfile);
router.get("/getUserDetails",auth,getAllUserDeatils);
//get enrolled courses
router.get("/getEnrolledCourses",auth,getEnrolledCourses);
router.put("/updateDisplayPicture",auth,updateDisplayPicture);

module.exports=router;
