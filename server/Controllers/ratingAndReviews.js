const RatingAndReview=require("../Models/RatingandReviews");
const Course=require("../Models/Course");
const RatingandReviews = require("../Models/RatingandReviews");
const { default: mongoose } = require("mongoose");
//create ratings
exports.createRating=async(req,res)=>{
    try{
        //data fetched and user id
        const userId=req.user.id;
        const {rating,review,courseId}=req.body;
        //check user enrolledment
        const coursedetails=await Course.findOne({_id:courseId,
            StudentEnrolled:{$elemMatch:{$eq:userId}},
        });
        if(!coursedetails){
            return res.status(404).json({
                success:false,
                message:"student didnt enrolled in this course ",
            })
        };
        const alreadyreviewd=await RatingAndReview.findOne({
            user:userId,
            course:courseId,
        });
        //check if already reviewd by user or not
        if(alreadyreviewd){
            return res.status(403).json({
                success:false,
                message:"course already reviewd by user",
            })
        }
        //create review ratings
        const ratingreview=await RatingAndReview.create({
            rating,review,course:courseId,
            user:userId,
        });
        //update course with this ratingandreview
        await Course.findByIdAndUpdate(courseId,{
            $push:{
                RatingAndReview:ratingreview,
            }
        },
    {new:true});
        //return response
        return res.status(200).json({
            success:true,
            message:"review successfully",
        });


    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}
//average ratings
exports.getAverageRating=async(req,res)=>{
    try{
        const {courseId}=req.body;
        const result=await RatingandReviews.aggregate([
            { $match: { course: new mongoose.Types.ObjectId(courseId) } },
            { $group: { _id: null, averageRating: { $avg: "$rating" } } }
        ]);
        if(result.length>0){
            return res.status(200).json({ success:true, averageRating: result[0].averageRating });
        }
        return res.status(200).json({ success:true, averageRating: 0 });
    }catch(error){
         return res.status(500).json({ success:false, message:error.message });
    }
}
//getall ratings
exports.getAllRating=async(req,res)=>{
    try{
        const allreviews=await RatingAndReview.find({})
                    .sort({rating:-1})
                    .populate({ path:"user", select:"firstName lastName email image" })
                    .populate({ path:"course", select:"CourseName" })
                    .exec();
        return res.status(200).json({ success:true, message:"all reviews fetched succesfully", data:allreviews });
    }catch(error){
        return res.status(500).json({ success:false, message:error.message });
    }
}