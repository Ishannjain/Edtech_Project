const mongoose=require("mongoose");
const CourseProgramSchema=new mongoose.Schema({
    courseID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
    },
    completeVideos:{
        type:mongoose.Schema.Types,ObjectId,
        ref:"SubSection",
    }
})
module.exports=mongoose.model("CourseProgram",CourseProgramSchema);