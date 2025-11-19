const {instance}=require("../Config/razorpay");
const Course=require("../Models/Course");
const User=require("../Models/User");
const mailSender=require("../utils/mailSender");
const {CourseEnrolledEmail}=require("../mail/CourseEnrolledEmail");
//capture the payment and initiate the razorpay
exports.capturePayment=async(req,res)=>{
        //get courseid and user id
        const {course_id}=req.body;
        const userId=req.user.id;
        //validation courseid ,coursedetails, user already pay for the pay for the same course
        if(!course_id){
            return res.json({
                success:false,
                message:"invlid courseid",
            })
        }
        let course;
        try{
            course=await Course.findById(course_id);
            if(!course){
                return res.status(404).json({
                    success:false,
                    message:"course not found",
                })
            }
            //user already pay for the same course
            const uid=new mongoose.Types.ObjectId(userId);
            if(course.StudentEnrolled.includes(uid)){
                return res.status(200).json({
                    success:false,
                    message:"student already enrolled",
                });
            }
        }catch(error){
            console.log(error);
            return res.status(500).json({
                    success:false,
                    message:error.message,
                });
        }
        //create order and return res
        const amount=course.price;
        const currency="INR";
        const options={
            amount:amount*100,
            currency,
            receipt:Math.random(Date.now()).toString(),
            notes:{
                courseID:course_id,
                userID,
            }
        }
        try{
            //intiate the payment using razorpay
            const paymentResponse=await instance.orders.create(options);
            console.log(paymentResponse);
            return res.status(200).json({
                success:true,
                message:"orders created successfully",
                CourseName:course.CourseName,
                courseDescription:course.CourseDescription,
                thumbnail:course.Thumbnail,
                ordrId:paymentResponse.id,
                currency:paymentResponse.currency,
                amount:paymentResponse.amount,
            })
        }catch(error){
            console.log(error);
            return res.status(500).json({
                    success:false,
                    message:error.message,
                });
        }
};
//verify signature of razorpay and server
exports.VerifySignature=async(req,res)=>{
    const webhookSecret="12345678";
    //razorpay signature
    const signature=req.headers["x-razorpay-signature"];
    //defined variables
    const shasum=crypto.createHmac("sha256",webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest=shasum.digest("hex");
    //match signature and digest
    if(signature===digest){
        console.log("payemnt is authorized");
        const {courseId,userId}=req.body.payload.payment.entity.notes;
        try{
            //fullfill the actions
            //find the course and enroll the student in it
            const enrolledCourse=await Course.findOneAndUpdate(
                {_id:courseId},
                {spush:{studentsEnrolled:userId}},
                {new:true},
            );
            if(!enrolledCourse){
                return res.status(500).json({
                    success:false,
                    message:"course not found",
                });
            }
            //find the student and add course to their list enrolled in course
            const enrolledStudent=await User.findOneAndUpdate(
                {_id:userId},
                {spush:{courses:courseId}},
                {new:true},
            );
            console.log(enrolledStudent);
            //send confirmation mail
            const emailResponse=await mailSender(enrolledStudent.email,"congrats you enrolled course","congro");
            return res.status(200).json({
                    success:true,
                    message:"enrolled process completed and signature veified",
                });
        }catch(error){
            return res.status(500).json({
                    success:false,
                    message:error.message,
                });
        }
    }
    else{
        return res.status(400).json({
            success:false,
            message:"invalid response",
        })
    }
}