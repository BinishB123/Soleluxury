const userController = require("../controller/userController")
const cartController = require("../controller/cartController")
const profileController = require("../controller/profileController")
const checkoutController =  require("../controller/checkoutController")
const orderController = require("../controller/orderController")
const express = require("express")
const user = require("../model/userModel")
const otpHelper=  require('../helper/otphelper')
const userHelper = require('../helper/userHelper')
const userRoute = express.Router()



//landing and authentication
userRoute.get("/",userController.guestUser)
userRoute.get('/login', userController.loginload)
userRoute.get('/signup',userController.loadSignUp)
userRoute.post('/signup',userController.insertUser)  
userRoute.post('/sendotp',otpHelper.sendOtp)
userRoute.post('/verify',otpHelper.verify)
userRoute.get('/logout',userController.logout)


//home views
userRoute.get('/home',userController.userHome)
userRoute.post('/home',userController.loginHome);  
userRoute.get("/search",userController.search);
userRoute.get("/nav",userController.nav)
userRoute.get("/filtered",userController.filteredBrand)
userRoute.get("/pricefiltered",userController.pricefiltered)

   


//product views
userRoute.get('/productview/:id',userController.productView)
userRoute.post("/size/:id/:size",userHelper.checkingUserBlockedOrNot,userController.displaySize)
userRoute.get('/prodcutwithsizecartcheck',cartController.sizeproductChecker)

   
 //cart views
 userRoute.get("/cart",userController.viewCart) 
 userRoute.post("/addtocart",cartController.addToCart) 
 userRoute.patch("/removeProductfromthecart",cartController.removeProductFromTheCart)
 userRoute.patch("/inOrDec",cartController.quantityIncrementOrDecrement)



 //user profile
 userRoute.get("/profile",userController.profile)
 userRoute.get("/addaddress",profileController.addAddressPage)
 userRoute.post('/addaddress',profileController.addAddress)
 userRoute.get("/editaddress",profileController.editAddresspage)
 userRoute.put("/editedAddress",profileController.editaddress)
 userRoute.post("/editprofile",userController.editUserProfile)
 userRoute.post("/changepassword",profileController.changePassword)
 userRoute.patch("/deleteaddress",profileController.deleteAddress)
 userRoute.patch("/changeEmailId", profileController.changeEmailid);





 //checkout
 userRoute.get("/checkout",checkoutController.checkoutPage)




 //user_order
 userRoute.post("/placeorder",orderController.placeOrder)
 userRoute.get("/orderplaced",orderController.orderPlacedCnfrm)
 userRoute.get("/orderdetails",orderController.orderDetails)
 userRoute.patch("/cancelOrder",orderController.cancelIndividualproductOrder)
 userRoute.patch("/returnOrder",orderController.returnOrder)



module.exports = userRoute   