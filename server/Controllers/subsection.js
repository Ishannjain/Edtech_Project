//import necessary modules
const Section=require("../Models/Section");
const SubSection=require("../Models/SubSection");
const {uploadImagesToCluodinary}=require("../utils/imageuploader");
exports.createSubsection=async(req,res)=>{
    try{
        //exract necessary information from the request body
        const {sectionId,title,description}=req.body;
        const video=req.files.video;
        //check if all necessary fields are provided
        if(!sectionId || !title ||!description ||!video){
            return res.status(404).json({
                success:false,
                message:"all fields are required",
            })
        }
        const uploadDetails=await uploadImagesToCluodinary(
            video,
            process.env.FOLDER_NAME
        )

    }
    catch(error){

    }
}
exports.updateSubsection=async(req,res)=>{
    try{
        const {sectionId,title,description}=req.body;
        const subsection=await SubSection.findById(sectionId);
        if(!subsection){
            return res.status(404).json({
                success:false,
                message:"Subsection not found",
            })
        }
        if(title!==undefined){
            subsection.title=title;
        }
        if(description!==undefined){
            subsection.description=description;
        }
        if(res.files && req.files.video !==undefined){
            const video=req.files.video
            const uploadDetails=await uploadImagesToCluodinary(
                video,
                process.env.FOLDER_NAME
            )
            subsection.videoUrl=uploadDetails.secure_url;
            subsection.timeDuration=`${uploadDetails.duration}`;
        }
    }
    catch(error){

    }
}
exports.deleteSubsection=async(req,res)=>{
    try{
        const {subsectionId,sectionId}=req.body;
        await Section.findByIdAndUpdate(
            {_id:sectionId},
            {
                $pull:{
                    subSection:subsectionId,
                },
            }
        )
        const subsection=await Subsection.findByIdAndUpdate({_id:subSectionId})
        if(!subsection){
            return res.status(404).json({
                success:false,
                message:"subsection not found"
            })
        }
        return res.status(200).json({
            success:true,
            mesage:"Subsection deleted successfully",
        })
    }catch(error){
         return res.status(500).json({
            success:false,
            mesage:"An error occured while deleting he Subsection",
        })
    }
}