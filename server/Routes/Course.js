//import the required modules
const express=require("express");
const router=express.Router();

//import the controllers
//course controllers import
const{createCourse,getAllCourses,getAllDetails}=require("../Controllers/course");
//catgoriescontrollers import
const {showAllCategories,createCategory,categoryPageDetails}=require("../controllers/Category");
//sections controllers import
const {createSection,updateSection,deleteSection}=require("../Controllers/section");
//subsection controllers import
const {createSubsection,updateSubSection,deleteSubSection}=require("../Controllers/subsection");
//Rating controllers import
const {createRating,getAverageRating,getAllRating}=require("../Controllers/ratingAndReviews");
//import middlewares
const {auth,isInstructor,isStudent,isAdmin}=require("../middlewares/auth");

//Course Routes

//courses can only be created by instructors
router.post("/createCourse",auth,isInstructor,createCourse);
//add a section to a course
router.post("/addSection",auth,isInstructor,createSection);
//update a section
router.post("/updateSection",auth,isInstructor,updateSection);
//delete a section
router.post("/deleteSection",auth,isInstructor,deleteSection);
//edit subsection
router.post("/updateSubSection",auth,isInstructor,updateSubSection);
//delete sunsection
router.post("/deleteSubSection",auth,isInstructor,deleteSubSection);
// add a subsection to a section
router.post("/addSubSection",auth,isInstructor,createSubsection);
//get all regiestered courses
router.get("getAllCourse",getAllCourses);


//Rating and reviews
router.post("/createRating",auth,isStudent,createRating);
router.get("/getAverageRating",getAverageRating);
router.get("/getReviews",getAllRating);
module.exports=router
