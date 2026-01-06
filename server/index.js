// libraries
const express=require("express");
const app=express();
const cookieParser=require("cookie-parser");
const cors=require("cors");
// routes
const UserRoutes=require("./Routes/User");
const PaymentsRoutes=require("./Routes/Payments");
const ProfileRoutes=require("./Routes/Profile");
const CourseRoutes=require("./Routes/Course");

const database=require("./Config/database");
const {cloudinaryConnect}=require("./Config/cloudinary");
const fileupload=require("express-fileupload");
const dotenv=require("dotenv");

dotenv.config();
const PORT=process.env.PORT ||4000;

//db.connect
database.connect();
//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin:"http://localhost:3000",
        credentials:true
    })
)
app.use(
    fileupload({
        useTempFiles:true,
        tempFileDir:"/tmp",
    })
)

cloudinaryConnect();
//routes mounting
app.use("/api/v1/auth",UserRoutes);
app.use("/api/v1/profile",ProfileRoutes);
app.use("/api/v1/course",CourseRoutes);
app.use("/api/v1/payment",PaymentsRoutes);

//def route

app.get("/",(req,res)=>{
    return res.json({
        success:true,
        message:"your serveris up and running..."
    });
});

//server activate
app.listen(PORT,()=>{
    console.log(`app is running on ${PORT}`);
})