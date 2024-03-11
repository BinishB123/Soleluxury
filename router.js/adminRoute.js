const adminController =   require("../controller/adminController")
const adminMiddleware = require('../middleware/adminAuth')
const customerController = require('../controller/customerController')
const productsController = require("../controller/productsController")
const categoryController = require('../controller/categoryController')
const adminOrderController = require("../controller/adminOrder")
const couponController = require("../controller/couponController")
const productOfferController = require("../controller/productOfferController")
const categoryOfferController = require("../controller/categoryOffer")
const salesReportController = require("../controller/salesReportController")
const upload = require('../middleware/multer')
const otpHelper = require('../helper/otphelper')
const express = require("express");
const userRoute = require("./userFeat");
const  adminRoute = express.Router()
     





//admin login
adminRoute.get("/",adminMiddleware.adminIsLogin,adminController.loginload)
adminRoute.post('/adminlogin',adminController.adminlogin)




//admin home
adminRoute.get('/adminhome', adminMiddleware.adminLogged , adminController.adminhome)
adminRoute.get('/logout', adminMiddleware.adminLogged , adminController.logout)




//coustomer Side
adminRoute.get('/customerlist', adminMiddleware.adminLogged , customerController.customerList)
adminRoute.get('/blockuser', adminMiddleware.adminLogged, customerController.blockUser)
adminRoute.get('/unblockuser', adminMiddleware.adminLogged, customerController.UnblockUser)




//products side
adminRoute.get('/products', adminMiddleware.adminLogged , productsController.productsLoad)
adminRoute.get('/addproducts',adminMiddleware.adminLogged,productsController.createProductPage)
adminRoute.post('/addproducts',upload.array("images",5),productsController.addproducts)
adminRoute.patch('/blockOrUnblockproduct',adminMiddleware.adminLogged,productsController.blockOrUnblockproduct)
adminRoute.get('/editproduct',adminMiddleware.adminLogged,productsController.getEditProduct)
adminRoute.post('/deleteimage',adminMiddleware.adminLogged,productsController.deleteImage)
adminRoute.post('/editProduct/:id',upload.array("images",5),productsController.productUpdate)
  



//category side 

adminRoute.get('/category',adminMiddleware.adminLogged,categoryController.categoryPage)
adminRoute.get('/editCategory',adminMiddleware.adminLogged,categoryController.categoryEditPage)
adminRoute.post("/editCategory/:id",adminMiddleware.adminLogged,categoryController.updateCategory)
adminRoute.get("/addcategory",adminMiddleware.adminLogged,categoryController.categoryAddPage)
adminRoute.post("/categoryadd",adminMiddleware.adminLogged,categoryController.addToCategory)
adminRoute.patch("/unlist",categoryController.unlistorlist)
    

//Adminside ORDER
adminRoute.get("/orders",adminMiddleware.adminLogged,adminOrderController.orderList)
adminRoute.get("/adminOrderDetail",adminMiddleware.adminLogged,adminOrderController.individualOrderDetail)
adminRoute.patch("/changestatus",adminMiddleware.adminLogged,adminOrderController.statusUpdating)


//Admin coupon
adminRoute.get("/coupon",adminMiddleware.adminLogged,couponController.couponPage)
adminRoute.post("/createCoupon",adminMiddleware.adminLogged,couponController.addCoupon)
adminRoute.get("/editcoupon",adminMiddleware.adminLogged,couponController.editCouponPage)
adminRoute.post("/updateCoupon",adminMiddleware.adminLogged,couponController.updatecoupon)


// AdmiN ProductOffer
adminRoute.get("/product-Offer",adminMiddleware.adminLogged,productOfferController.productOfferPage)
adminRoute.post("/Add-productOffer",adminMiddleware.adminLogged,productOfferController.AddProductOffer)
adminRoute.get("/productEditOffer/:id",adminMiddleware.adminLogged,productOfferController.editProductOffer)
adminRoute.post("/productEditOffer",adminMiddleware.adminLogged,productOfferController.productEditOffer)
adminRoute.delete("/deleteoffer",adminMiddleware.adminLogged,productOfferController.deleteOffer)


// Admin category 
adminRoute.get("/categoryOffer",adminMiddleware.adminLogged,categoryOfferController.categoryOfferPage)
adminRoute.post("/addcategoryoffer",adminMiddleware.adminLogged,categoryOfferController.AddCategoryOffer)
adminRoute.get("/categoryEditOffer/:id",adminMiddleware.adminLogged,categoryOfferController.editcategoryOffer)
adminRoute.post("/categoryEditOffer",adminMiddleware.adminLogged,categoryOfferController.categoryEditOffer)
adminRoute.delete("/deleteCategoryoffer",adminMiddleware.adminLogged,categoryOfferController.deleteOffer)

//Admin Salesreport
adminRoute.get("/sales-report",adminMiddleware.adminLogged,salesReportController.salesReportPage)



module.exports = adminRoute