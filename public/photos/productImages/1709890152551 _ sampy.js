function generateSixDigitNumber() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  
  const randomNumber = generateSixDigitNumber();
  console.log(randomNumber); 
  

const transporter = nodemailer.createTransport({
   service: 'gmail', // Replace with your email service
    auth: {
      user: 'binishb2018@gmail.com', // Replace with your email address
      pass: 'b!n!5h@jsbhb2oo2' // Replace with your email password
    }
  });

const sendOtp = async (req,res)=>{
    try{
        const otp = generateSixDigitNumber();
        const userEmail = req.body.email;
          
          const mailOptions ={
            from :"binishb2018@gmail.com",
            to :  userEmail,
            subject :"Your Otp Verfication code",
            text:`Your Otp is ${otp} `
          }


          await transporter.sendMail(mailOptions)
          req.session.otp = otp;
          res.json({message:'OTP Send To Your Email'})
          
    }catch(error){
        console.log(error)
         res.status(500)
    }
}