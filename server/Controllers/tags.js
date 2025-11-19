const Tag=require("../Models/Tags");
//create tag handler function
exports.createTag=async(req,res)=>{
    try{
        //fetchdata and validate data
        const {name,description}=req.body;
        if(!name||!description){
            return res.status(400).json({
                success:false,
                message:"all fields required to be filled",
            })
        }
        //create db entry
        const tagDetails=await Tag.create({
            name:name,
            description:description,
        });
        console.log(tagDetails);
        return res.status(200).json({
            success:true,
            message:"tag created successfully",
            tagDetails,
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
};
//get all tags handler function
exports.ShowAllTags=async(req,res)=>{
    try{
        const alltags=await Tag.find({name:true,description:true});
        return res.status(200).json({
            success:true,
            message:"all tags returned successfully",
            alltags,
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}