const userModel = require("../model/userModel");
const userHelper = require("../helper/userHelper");
const nodemailer = require("nodemailer");
const { response } = require("express");

//loginuser start//
const loginload = function (req, res) {
  console.log("Request come to userloginLoad");
  if (req.session.user) {
    res.redirect("/home");
  } else {
   
    res.render("login");
  }
};

const loadSignUp = function (req, res) {
  if (req.session.user) {
    res.redirect("/home");    
  } else {
   const message=req.flash("message");
    res.render("signup",{message:message});
  }
};

function generateSixDigitNumber() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const transporter = nodemailer.createTransport({
  service: "gmail", // Replace with your email service
  auth: {
    user: "binishb2018@gmail.com", // Replace with your email address
    pass: "hygn octr fjti bawk", // Replace with your email password
  },
});

const sendOtp = async (req, res) => {
  console.log("Request came to send the OTP");

  try {
    console.log("Request came to send the OTP");

    const otp = generateSixDigitNumber();
    req.session.otpExpiry = Date.now()+30*1000
    
    console.log(otp, "OTP generated");
    const userEmail = req.body.email;
    console.log(userEmail+" otp sending to this email");

    if (!userEmail) {
      return res
        .status(400)
        .json({ error: "Invalid or missing email address" });
    }

    const mailOptions = {
      from: "binishb2018@gmail.com",
      to: userEmail,
      subject: "Your OTP Verification code",
      text: `Your OTP is ${otp}`,
    };

    // Send email asynchronously without waiting for it to complete
    
    transporter.sendMail(mailOptions, (error) => {
      console.log("1st")
      if (error) {
        console.log(error);
        return res.status(500).json({ error: "Error sending OTP email" }); 
      }
      console.log("otp sended to the user email");
    });
      console.log("2")
    req.session.otp = otp;
    res.json({ message: "OTP Sent To Your Email ! Check it " });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const verify =  (req, res) => {
  
    const sendedOtp = req.session.otp;
    const verifyOtp = req.body.otp;
    console.log(sendedOtp);
    console.log(verifyOtp);    
    console.log("started checking");

    if (sendedOtp === verifyOtp) {
      if(Date.now() < req.session.otpExpiry){
        console.log("otp Entered before time expires")
      req.session.otpmatched = true;
      res.json({ status: true, message: "otp verified" });
      }else{
        console.log("failed otp verification")
        req.session.otpmatched = false;
        res.json({ status: false, message: "failed" });
      }
    
    } else {
      console.log("verification fails")
      req.session.otpmatched = false;
      res.json({ status: false, message: "failed" });
    }
  };

const insertUser = async (req, res) => {
  try {
    console.log("Request Entered to insertUser");
    console.log(req.body.confirmPassword)
    const response = await userHelper.doSignUp(
      req.body,
      req.session.otpmatched
    );
    if (!response.status) {
      const message = response.message;           
      req.flash("message", message);
      res.redirect("/signup");
    } else {
      
      res.render("login",{message:response.message});
    }
  } catch (err) {}
};

const loginHome = async (req, res) => {
  try {
    const response = await userHelper.loginHome(req.body);
    
    if (response.login) {
      req.session.user = response.user;
      console.log('User logged in successfully:', response.user);
      res.redirect("/home");
    } else {
      console.log('Login failed:', response.loginMessage);
      res.render("login", { errorMessage: response.loginMessage });
    }
  } catch (error) {
    console.error('Error in loginHome:', error);
      res.status(500).send('Internal Server Error');
  }
};
const userHome = async(req,res)=>{
  if (req.session.user) {
    res.render("home")
  }else{
    res.redirect('/')
  }
}

const logout = (req,res)=>{
  try{
      req.session.user = null
      res.redirect('/')

  }catch(error){
    console.log(error)
  }
}

const userController = { 
  loginload,
  loadSignUp,
  sendOtp,
  verify,
  insertUser,
  loginHome,
  userHome,
  logout
};

module.exports = userController;
