const Course=require("../Models/Course");
const Tag=require("../Models/Tags");
const User=require("../Models/User");
const {uploadImageToCloudinary}=require("../utils/imageuploader");
//createcourse handler function
exports.CreateCourse=async(req,res)=>{
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
            const thumbnailImage=await uploadImageToCloudinary(Thumbnail,process.env.FOLDER_NAME);
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
            //to store new course in it instructor details through course id
            await User.findByIdAndUpdate(
                {_id:instrcutordetails._id},
                {
                    Spush:{
                        courses:newcourse._id,
                    }
                },
                {new:true},
            );
        //updtae tag schema
        await Tag.findByIdAndUpdate(
            {_id:tagdetails._id},
            {new:true},
        )
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
exports.ShowAllCourses=async(req,res)=>{
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
exports.getCourseDetails=async(req,res)=>{
    try{
        //get id
        const {courseId}=req.body;
        //find coursedetails
        const coursedetails=await Course.find({_id:courseId}).populate({
            path:"instructor",
            path:"additionlDetails",
        }
        ).populate("category").populate("ratingAndReviews").populate({
            path:"courseContent",
            populate:{
                path:"subSection",
            },
        }).exec();
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