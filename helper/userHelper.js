const order = require("../model/orderModel");
const user = require("../model/userModel");
const userModel = require("../model/userModel");
const walletModel = require("../model/walletModel")
const bcrypt = require("bcrypt");
const Razorpay = require("razorpay")
var instance = new Razorpay({
  key_id: process.env.key_id,
  key_secret: process.env.key_secret ,
});


const loginHome = (userData)=>{
  // console.log(userData)
  return new Promise(async(resolve,reject)=>{

         try{
         
             let user = await userModel.findOne({email:userData.email});
              let response = {}
                
                 if(user){
                  
                   //console.log('The user is now at loginhome and and finded the user')
                  // console.log(user.isActive)
                   if (user.isActive) {
                       bcrypt.compare(userData.password,user.password).then((result)=>{
                        if(result){
                          // console.log(result)
                            response.user = user
                            response.login = true;
                            //  console.log(response)
                            resolve(response)
                        }else{
                          response.loginMessage = "invalid email or password"
                          resolve(response)
                        }
                      })
                   }else{
                      response.loginMessage ="Your are Blocked"
                      resolve(response)
                   }
                     
                 }else{
                   response.loginMessage ="invalid username or password"
                   resolve(response)
                 }
         
         }catch(error){
          console.log(error);
         
         }
            
     

  })
}










const doSignUp = (userData, verify, emailVerify) => {
  return new Promise(async (resolve, reject) => {
    try {
      const userExist = await userModel.findOne({
        $or: [{ email: userData.email }, { mobile: userData.mobile }],
      });

      const response = {};

      if (userData.referralcode) {
        const userWithReferralcode = await userModel.findOne({ referalCode: userData.referralcode });

        if (userWithReferralcode) {
          const userHaveWallet = await walletModel.findOne({ userid: userWithReferralcode._id });

          if (userHaveWallet) {
            // Assuming checker object and userid are defined somewhere
            const updating = await walletModel.updateOne(
              { userid: userWithReferralcode._id },
              {
                $push: {
                  walletDatas: {
                    amount: 100,
                    date: new Date(),
                    paymentMethod: "referral Offer",
                  },
                },
                $inc: { balance: 100 },
              }
            );
            // console.log("updating in if ", updating);
          } else {
            const creating = await walletModel.create({
              userid: userWithReferralcode._id,
              balance: 100,
              walletDatas: [
                {
                  amount: 100,
                  date: new Date(),
                  paymentMethod: "referral Offer",
                },
              ],
            });
            // console.log("creating in else", creating);
          }
        }
      }

      if (emailVerify === userData.email) {
        if (!userExist) {
          // console.log("user not exist");

          if (userData.password === userData.confirmPassword) {
            // console.log("password matched");
            // console.log(verify);

            if (verify) {
              // console.log("verified");

              const password = await bcrypt.hash(userData.password, 10);
              const referalCode = await generateRandomString();

              const newUser = {
                name: userData.name,
                email: userData.email,
                mobile: userData.mobile,
                password: password,
                referalCode: referalCode,
              };

              const createdUser = await userModel.create(newUser);

              // console.log("User created:", createdUser);
              response.user = createdUser
              response.status = true;
              response.message = "Signed Up Successfully";
              resolve(response);
            } else {
              response.status = false;
              response.message = "OTP Does not match";
              resolve(response);
            }
          } else {
            response.status = false;
            response.message = "Password does not match";
            resolve(response);
          }
        } else {
          response.status = false;
          response.message = "User already exists";
          resolve(response);
        }
      } else {
        response.status = false;
        response.message = "Email not matched";
        resolve(response);
      }
    } catch (error) {
      console.error("Error during sign up:", error);
      reject(error);
    }
  });
};



const checkingUserBlockedOrNot = async (req, res, next) => {
  try {
   if(req.session.user){
    next()
   }else{
    res.redirect("/login")
   }
  } catch (error) {
    console.log(error.message);
  }
};


const generateRazorpay = (userId,totalAmount)=>{
  return new Promise(async(resolve,reject)=>{
    try {
      // console.log("orderid at generate razorpay",orderId)
      // console.log("totalAmount ",totalAmount)
      instance.orders.create({
        amount: Math.round(totalAmount*100),
        currency: "INR",
        receipt: userId,
        notes: {
            key1: "value3",
            key2: "value2"
        }
    }, function(err, order) {
        if (err) {
            console.error(err);
            return;
        }else{
          const response = {
            success:true,
            order:order
          }
          //  console.log("order in generateRazorpay",order)
          resolve(response)
        }
        
    });
    
      
    } catch (error) {
      console.log(error.message)
    }
  })
}



function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 15; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
  }
  return result;
}



module.exports = {
  doSignUp,
  loginHome,
  checkingUserBlockedOrNot,
  generateRazorpay
};
