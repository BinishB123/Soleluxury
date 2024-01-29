const userController = require("../controller/userController")
const express = require("express")
const user = require("../model/userModel")
const userRoute = express.Router()

userRoute.get('/', userController.loginload)
userRoute.get('/signup',userController.loadSignUp)
userRoute.post('/signup',userController.insertUser)
userRoute.post('/sendotp',userController.sendOtp)
userRoute.post('/verify',userController.verify)
userRoute.post('/home',userController.loginHome);  
userRoute.get('/home',userController.userHome)
userRoute.get('/logout',userController.logout)





module.exports = userRoute   