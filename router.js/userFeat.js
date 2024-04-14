const userController = require("../controller/userController")
const cartController = require("../controller/cartController")
const profileController = require("../controller/profileController")
const checkoutController =  require("../controller/checkoutController")
const orderController = require("../controller/orderController")
const wishlistController = require("../controller/wishlistController")
const couponController = require("../controller/couponController")
const walletContoller = require("../controller/walletController")
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
userRoute.get("/forgotPassword",userController.forgotPassword)
userRoute.post("/changingPassword",userController.updatingPassword)


//home views
userRoute.get('/home',userController.userHome)
userRoute.post('/home',userController.loginHome);  
userRoute.get("/search",userController.search);
userRoute.get("/nav",userController.nav)
userRoute.get("/filtered",userController.filteredBrand)
userRoute.post("/pricefiltered",userController.pricefiltered)
userRoute.post("/categoryFilter",userController.categoryFilter)



  
//product views
userRoute.get('/productview/:id',userController.productView)
userRoute.post("/size/:id/:size",userController.displaySize)
userRoute.get('/prodcutwithsizecartcheck',userHelper.checkingUserBlockedOrNot,cartController.sizeproductChecker)

   
 //cart views 
 userRoute.get("/cart",userHelper.checkingUserBlockedOrNot,userController.viewCart) 
 userRoute.post("/addtocart",userHelper.checkUserBlockOrNo,cartController.addToCart) 
 userRoute.patch("/removeProductfromthecart",userHelper.checkingUserBlockedOrNot,cartController.removeProductFromTheCart)
 userRoute.patch("/inOrDec",userHelper.checkingUserBlockedOrNot,cartController.quantityIncrementOrDecrement)



 //user profile
 userRoute.get("/profile",userHelper.checkingUserBlockedOrNot,userController.profile)
 userRoute.get("/addaddress",userHelper.checkingUserBlockedOrNot,profileController.addAddressPage)
 userRoute.post('/addaddress',userHelper.checkingUserBlockedOrNot,profileController.addAddress)
 userRoute.get("/editaddress",userHelper.checkingUserBlockedOrNot,profileController.editAddresspage)
 userRoute.put("/editedAddress",userHelper.checkingUserBlockedOrNot,profileController.editaddress)
 userRoute.post("/editprofile",userHelper.checkingUserBlockedOrNot,userController.editUserProfile)
 userRoute.post("/changepassword",userHelper.checkingUserBlockedOrNot,profileController.changePassword)
 userRoute.patch("/deleteaddress",userHelper.checkingUserBlockedOrNot,profileController.deleteAddress)
 userRoute.patch("/changeEmailId",userHelper.checkingUserBlockedOrNot, profileController.changeEmailid);





 //checkout
 userRoute.get("/checkout",userHelper.checkingUserBlockedOrNot,checkoutController.checkoutPage)




 //user_order
 userRoute.post("/placeorder",userHelper.checkingUserBlockedOrNot,userHelper.productQuantityChecker,userHelper.addresChecker,orderController.placeOrder)
 userRoute.get("/orderplaced",userHelper.checkingUserBlockedOrNot,orderController.orderPlacedCnfrm)
 userRoute.get("/orders",userHelper.checkingUserBlockedOrNot,orderController.orders)
 userRoute.get("/orderdetails",userHelper.checkingUserBlockedOrNot,orderController.orderdetails)
 userRoute.post("/invoicedownload",userHelper.checkingUserBlockedOrNot,orderController.invoiceDownload)
 userRoute.patch("/cancelOrder",userHelper.checkingUserBlockedOrNot,orderController.cancelIndividualproductOrder)
 userRoute.patch("/returnOrder",userHelper.checkingUserBlockedOrNot,orderController.returnOrder)
 userRoute.post("/verify-payment",userHelper.checkingUserBlockedOrNot,orderController.verifyPayment)


 //USER COUPON
 userRoute.post("/use-coupon",userHelper.checkingUserBlockedOrNot,couponController.couponUse)


 //wishlist 
 userRoute.get("/wishlist",userHelper.checkingUserBlockedOrNot,wishlistController.whistlistPage)
 userRoute.post("/addtowishlist",userHelper.checkingUserBlockedOrNot,wishlistController.addToWishlist)
 userRoute.patch("/removefromwishlist",userHelper.checkingUserBlockedOrNot,wishlistController.removeWishlist)


 //wallet 
 userRoute.get("/wallet",userHelper.checkingUserBlockedOrNot,walletContoller.wallet)
 userRoute.post("/add-money-to-wallet",userHelper.checkingUserBlockedOrNot,walletContoller.addMoneyWallet)
 userRoute.post('/wallet-verifypayment',userHelper.checkingUserBlockedOrNot,walletContoller.verifyPayment)



module.exports = userRoute   