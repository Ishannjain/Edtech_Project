const Category=require("../Models/Category");
exports.createCategory=async(req,res)=>{
    try{
        const {name,description}=req.body;
        if(!name){
            return res.status(400).json({ success:false, message:"name is required" });
        }
        const categorydetails=await Category.create({ name, description });
        return res.status(200).json({ success:true, message:"category created successfully", data:categorydetails });
    }catch(error){
        return res.status(500).json({ success:false, message:error.message })
    }
}

exports.showAllCategories=async(req,res)=>{
    try{
        const categories=await Category.find().populate("courses").exec();
        return res.status(200).json({ success:true, data:categories });
    }catch(error){
        return res.status(500).json({ success:false, message:"internal server error", error:error.message });
    }
}

//category page details
exports.categoryPageDetails=async(req,res)=>{
    try{
        const {categoryId}=req.body;
        const selectedCategory=await Category.findById(categoryId).populate("courses").exec();
        if(!selectedCategory){
            return res.status(404).json({ success:false, message:"category not found" });
        }
        const differentCategories=await Category.find({ _id: { $ne: categoryId } }).limit(10).exec();
        const allcategories=await Category.find().populate("courses").exec();
        const allcourses=allcategories.flatMap((category)=>category.courses || []);
        const mostsellingcourses=allcourses.sort((a,b)=>(b.sold||0)-(a.sold||0)).slice(0,10);
        return res.status(200).json({ selectedCategory, differentCategories, mostsellingcourses });
    }catch(error){
        return res.status(500).json({ success:false, message:"internal server error", error:error.message });
    }
}