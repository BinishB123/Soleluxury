const user = require("../model/userModel");
const userModel = require("../model/userModel");
const bcrypt = require("bcrypt");



const loginHome = (userData)=>{
  console.log(userData)
  return new Promise(async(resolve,reject)=>{

         try{
         
             let user = await userModel.findOne({email:userData.email});
              let response = {}
                
                 if(user){
                  
                   console.log('The user is now at loginhome and and finded the user')
                   console.log(user.isActive)
                   if (user.isActive) {
                       bcrypt.compare(userData.password,user.password).then((result)=>{
                        if(result){
                          console.log(result)
                            response.user = user
                            response.login = true;
                             console.log(response)
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










const doSignUp = (userData, verify) => {
  return new Promise(async (resolve, reject) => {
    const userExist = await userModel.findOne({
      $or: [{ email: userData.email }, { mobile: userData.mobile }],
    });
    const response={};
    console.log("Hello");
    if (!userExist) {
      console.log("user not exist");
      console.log(userData.password +" "+userData.confirmPassword)
      if (userData.password === userData.confirmPassword) {
        console.log("password matched");
        console.log(verify);
        if (verify) {
          console.log("verfied");
          try {
            const password = await bcrypt.hash(userData.password, 10);
            const userd = {
              name: userData.name,
              email: userData.email,
              mobile: userData.mobile,
              password: password,
            };
            userModel
              .create(userd)
              .then((data) => {
                response.status=true;
                response.message="Signed Up Successfully";
                resolve(response);
                console.log(data);
              })
              .catch((error) => {
                console.log(error);
              });
          } catch (error) {
            console.log(error.message);
          }
        } else {
          response.status =false,
          response.message="OTP Doesnt match";
          resolve(response);
        }
      }else{
        response.status = false;
        response.message = "Password doesn't Match"
        resolve(response)
      }
    } else {
      response.status=false;
      response.message="User already Exists";
      resolve(response);
    }
  });
};





module.exports = {
  doSignUp,
  loginHome
};
