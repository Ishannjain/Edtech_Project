const Category=require("../Models/Category");
exports.createCategory=async(req,res)=>{
    try{
        const {name,description}=req.body;
        if(!name){
            return res.status(400).json({
                success:false,
                message:"all fields are required",
            })
        }
        const categorydetails=await Category.create({
            name:name,
            description:description,
        });
        return res.status(200).json({
            success:true,
            message:"categorys created successfully",
        });

    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}
exports.showallcategory=async(req,res)=>{
    try{

    }catch(error){
        return res.status(500).json({
            success:false,
            message:"internal server error",
            error:error.message,
        });
    }
}
//category page details
exports.categorypagedetails=async(req,res)=>{
    try{
        //get categoryId
        const {categoryId}=req.body;
        //GET COURSE FOR specified courseid
        const selectedcategory=await Category.findById(categoryId).populate("courses").exec();
        //validation
        if(!selectedcategory){
            return res.status(404).json({
            success:false,
            message:"data not found",
            error:error.message,
        });
        }
        //getcourses different categories
        const differentcategory=await Category.find({
            _id:{$ne:categoryId},

        });
        //get top selling courses
        const allcategories=await Category.find().populate("courses");
        const allcourses=allcategories.flatMap((category)=>category.courses);
        const mostsellingcourses=allcourses.sort((a,b)=>b.sold-a.sold)
        .slice(0,10);
        res.status(200).json({
            selectedcourses:selectedcourses,
            differentCourses:differentCourses,
            mostseellingcourses:mostsellingcourses,
        })
        //return res

    }catch(error){
        return res.status(404).json({
            success:false,
            message:"internal server error",
            error:error.message,
        });
    }
}