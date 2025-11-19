const mongoose=require("mongoose");
require("dotenv").config();

exports.connect=()=>{
    mongoose.connect(process.env.MONGODB_URL)
    .then(()=>{
        console.log("DB connected")
    })
    .catch((err)=>{
        console.log("error occured during db connections");
        console.log(err);
        process.exit(1);
    })
}