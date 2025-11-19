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
            studentEnrolled:{$elemMatch:{$eq:userId}},
        },
        );
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
exports.getAveragerating=async(req,res)=>{
    try{
        //get courseId
        const {courseId}=req.body.courseId;

        //calculate average rating
        const result=await RatingandReviews.aggregate([
            {
                $match:{
                    course:new mongoose.Types.ObjectId(courseId),

                },
            },
            {
                $group:{
                    _id:null,
                    averageRating:{$avg:"$rating"},

                }
            }
        ])
        //return rating
        if(result.length>0){
            return res.status(200).json({
                success:true,
                message:"got rating",
                averageRating:result[0].averageRating,
            })
        }
        // if not rating
        return res.status(200).json({
                success:true,
                message:"no ratings found yet",
                averageRating:0,
            })
    }catch(error){
         return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}
//getall ratings
exports.getallratings=async(req,res)=>{
    try{
        const allreviews=(await RatingAndReview.find({}))
                    .sort({rating:"desc"})
                    .populate({
                        path:"user",
                        select:"firstname lastname email image",
                    })
                    .populate({
                        path:"course",
                        select:"courseName",
                    })
                    .exec();
                return res.status(200).json({
                    sucess:true,
                    message:"all reviews fetched succesfully",
                    data:allreviews,
                })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}