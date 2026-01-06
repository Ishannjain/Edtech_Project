const Course=require("../Models/Course");
const Tag=require("../Models/Tags");
const User=require("../Models/User");
const {uploadImageTocloudinary}=require("../utils/imageuploader");
//createcourse handler function
exports.createCourse=async(req,res)=>{
    try{
        //fetch data and file and validation 
        //tag here is ojectid from course
        const {CourseName,CourseDescription, WhatYouWillLearn,price,tag}=req.body;

        //tag thumbnail
        const Thumbnail=req.files.Thumbnail;
        //validation
        if(!CourseName||!CourseDescription||!WhatYouWillLearn||!price ||!tag||!Thumbnail){
            return res.status(401).json({
                success:false,
                message:"all fields are necesaary",
            })
        }
        //check for instructor
            const userId=req.user.id;
            const instrcutordetails=await User.findById(userId);
            if(!instrcutordetails){
                return res.status(404).json({
                    success:false,
                    message:"instrcutor data not found",
                });
            }
            //check given tag is valid or not
            const tagdetails=await Tag.findById(tag);
            if(!tagdetails){
                return res.status(404).json({
                    success:false,
                    message:"tag details not found",
                });
            }
            //upload image to cloudinary
            const thumbnailImage=await uploadImageTocloudinary(Thumbnail,process.env.FOLDER_NAME);
            //create an entry for new course
            const newcourse=await Course.create({
                CourseName,
                CourseDescription,
                instructor:instrcutordetails._id,
                WhatYouWillLearn:WhatYouWillLearn,
                price,
                tag:tagdetails._id,
                thumbnail:thumbnailImage.secure_url,
            });
            //store course id on instructor
            await User.findByIdAndUpdate(instrcutordetails._id, { Course: newcourse._id }, { new: true });
        // optionally update tag metadata (no-op safe update)
        await Tag.findByIdAndUpdate(tagdetails._id, {}, { new: true });
        return res.status(200).json({
            success:true,
            message:"Course Created Successfully",
            data:newcourse,
        });
    }catch(error){
            return res.status(500).json({
                success:false,
                message:"failed to create new course",
            })
    }
}
//getallcourses handler function
exports.getAllCourses=async(req,res)=>{
    try{
        const allcourses=await Course.find({},{CourseName:true,
            prce:true,
            thumbnail:true,
            instructor:true,
            RatingAndReview:true,
            StudentEnrolled:true,
        }).populate("instructor").exec();
        return res.status(200).json({
            success:true,
            message:"all Courses returned successfully",
            allcourses,
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}
//getcoursedetails
exports.getAllDetails=async(req,res)=>{
    try{
        //get id
        const {courseId}=req.body;
        //find coursedetails
        const coursedetails=await Course.findById(courseId)
            .populate({ path: "instructor", populate: { path: "additionalDetails" } })
            .populate("category")
            .populate("RatingAndReview")
            .populate({ path: "CourseContent", populate: { path: "subSection" } })
            .exec();
        //validation
        if(!coursedetails){
            return res.status(400).json({
                success:false,
                message:"could not find the course with that id",
            });
        }
        //return res
        return res.status(200).json({
            success:true,
            message:"Course Details fetched Succesfully",
            data:coursedetails,
        });
    }catch(error){
        console.log(error);
        return res.status(400).json({
                success:false,
                message:error.message,
            });
    }
}