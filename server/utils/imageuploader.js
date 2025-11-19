const cloudinary=require("cloudinary");
exports.uploadImageTocloudinary=async(file,folder,height,quality)=>{
    const options={folder};
    if(!height){
        options.heigt=height;
    }if(!quality){
        options.quality=quality;
    }
    options.resource_type="auto";
    return await cloudinary.Uploader.upload(file.tempFilePath,options);
}