const userController = require("../controller/userController")
const express = require("express")
const user = require("../model/userModel")
const otpHelper=  require('../helper/otphelper')
const userRoute = express.Router()

userRoute.get('/', userController.loginload)
userRoute.get('/signup',userController.loadSignUp)
userRoute.post('/signup',userController.insertUser)  
userRoute.post('/sendotp',otpHelper.sendOtp)
userRoute.post('/verify',otpHelper.verify)
userRoute.post('/home',userController.loginHome);  
userRoute.get('/home',userController.userHome)
userRoute.get('/logout',userController.logout)



//home views
userRoute.get('/productview/:id',userController.productView)
userRoute.post("/size/:id/:size",userController.displaySize)

   



module.exports = userRoute   