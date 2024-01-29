const adminController =   require("../controller/adminController")
const express = require("express");
const userRoute = require("./userFeat");
const  adminRoute = express.Router()

adminRoute.get("/",adminController.loginload)
adminRoute.post('/adminlogin',adminController.adminlogin)  
adminRoute.get('/adminhome',adminController.adminhome)
adminRoute.get('/logout',adminController.logout)







module.exports = adminRoute