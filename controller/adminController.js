const Admin = require("../model/adminModel")








//const  nodemailer = require("nodemailer");

// function generateSixDigitNumber() {
//     return Math.floor(100000 + Math.random() * 900000).toString();
//   }
  
//   const transporter = nodemailer.createTransport({
//     service: "gmail", // Replace with your email service
//     auth: {
//       user: "binishb2018@gmail.com", // Replace with your email address
//       pass: "hygn octr fjti bawk", // Replace with your email password
//     },
//   });
  
//   const sendOtp = async (req, res) => {
//     console.log("Request came to send the OTP");
  
//     try {
//       console.log("Request came to send the OTP");
  
//       const otp = generateSixDigitNumber();
//       req.session.otpExpiry = Date.now()+30*1000
      
//       console.log(otp, "OTP generated");
//       const userEmail = req.body.email;
     
  
//       if (!userEmail) {
//         return res
//           .status(400)
//           .json({ error: "Invalid or missing email address" });
//       }
  
//       const mailOptions = {
//         from: "binishb2018@gmail.com",
//         to: userEmail,
//         subject: "Your OTP Verification code",
//         text: `Your OTP is ${otp}`,
//       };
  
//       // Send email asynchronously without waiting for it to complete
      
//       transporter.sendMail(mailOptions, (error) => {
//         console.log("1st")
//         if (error) {
//           console.log(error);
//           return res.status(500).json({ error: "Error sending OTP email" }); 
//         }
//         console.log("otp sended to the user email");  
//       });
//         console.log("2")
//       req.session.otp = otp;
//      console.log(otp)
//       res.json({ message: "OTP Sent To Your Email ! Check it " });
//     } catch (error) {
//       console.log(error);
//       res.status(500).json({ error: "Internal Server Error" });
//     }
//   };
  
//   const verify =  (req, res) => {
    
//       const sendedOtp = req.session.otp;
//       const verifyOtp = req.body.otp;
//       console.log(sendedOtp);
//       console.log(verifyOtp);    
//       console.log("started checking");
  
//       if (sendedOtp === verifyOtp) {
//         if(Date.now() < req.session.otpExpiry){
//           console.log("otp Entered before time expires")
//         req.session.otpmatched = true;
//         res.json({ status: true, message: "otp verified" });
//         }else{
//           console.log("failed otp verification")
//           req.session.otpmatched = false;
//           res.json({ status: false, message: "failed" });
//         }
      
//       } else {
//         console.log("verification fails")
//         req.session.otpmatched = false;
//         res.json({ status: false, message: "failed" });
//       }
//     };






const loginload = async(req,res)=>{
      console.log("Request come to admin  login")
      if (req.session.admin) {
        res.redirect("/admin/adminhome");
      }else{
        const message = req.flash("errorMessage")
        res.render("adminlogin",{errorMessage:message})
      }
}

const adminlogin =async(req,res)=>{
    try{
        console.log("admin login load",req.body.email)
        const admin = await Admin.findOne({email:req.body.email})
        
        console.log(admin)
      if (req.session.otpmatched) {
          if (admin) {
            console.log(" /////")
            console.log(admin.email)
            console.log(admin.password)
            console.log('///')
            console.log( req.body.password)
            
            if(admin.password===req.body.password){
                console.log( req.body.password)   
                req.session.admin = admin
                res.redirect("/admin/adminhome")
            }else{
                 req.flash("errorMessage","invalid emailid or password")
                 res.redirect('/admin')
                 console.log("password incorrect")
            }  
        }else{
            req.flash("errorMessage","invalid emailid or password") 
            res.redirect('/admin')
        }

        
      }else{
           req.flash("errorMessage","Otp mismatch")
            res.redirect('/admin')
      }  
        
    }catch(error){  
       console.log("Error in  admin login: "+error)
       res.status(500).send("internal server error")
    }
}

const adminhome = (req,res)=>{
    
    if(req.session.admin){
        
        res.render('adminhome')
    }else{   
        res.redirect('/admin');
    }
}


const logout = (req,res)=>{
    try{
        req.session.admin = null
        res.redirect('/admin')
       
    }catch(error){
      console.log(error)
    }
  }
 
  


const adminController ={
    loginload,
    adminlogin,
    adminhome,
    logout,
   // sendOtp,
    //verify
    
}    

module.exports = adminController