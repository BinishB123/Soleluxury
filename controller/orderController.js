const cartModel = require("../model/cartModel")
const productModel = require("../model/productModel")
const userModel = require("../model/userModel")
const placeOrderHelper = require("../helper/placeOrderHelper")
const orderModel = require("../model/orderModel")
const cartController = require("../controller/cartController")
const { response } = require("express")
const ObjectId = require("mongoose").Types.ObjectId



const placeOrder = async(req,res)=>{
    try {
        const body = req.body
        console.log("body ,"+body)
        const user = req.session.user._id
        const placedOrder = await placeOrderHelper.placeOrder(body,user)
        console.log(placedOrder)
        if (placedOrder.status==true) {
            const cartcleared = await cartController.clearingCart(user)
            if (cartcleared) {
                res.json({success:true,url:"/orderplaced"})
            }
        }else{
            res.json({success:false,message:placedOrder.message,url:"/cart"})
        }

    } catch (error) { 
        console.log(error.message)
    }
}







const orderPlacedCnfrm = async (req,res)=>{
    try {
        
        res.render("orderplaced")
        
    } catch (error) {
        
    }
}



const orderDetails = async(req,res)=>{
    try {
        const userId = req.session.user._id
        const userOrders = await orderModel.aggregate([
            { $match: { user: new ObjectId(userId) } },
            { $sort: { orderedOn: -1 } }, 
            { $unwind: "$products" } 
          ]);
          
          const products = await orderModel.aggregate([
            { $match: { user: new ObjectId(userId) } }, 
            { $sort: { orderedOn: -1 } }, 
            { $unwind: "$products" }, 
            { 
                $lookup: { 
                    from: "products", 
                    localField: "products.product", 
                    foreignField: "_id", 
                    as: "product" 
                } 
            },
            {
                $project: {
                    "productName": { $arrayElemAt: ["$product.productName", 0] },
                    "productImage": { $arrayElemAt: ["$product.productImage", 0] },
                    "_id":{ $arrayElemAt: ["$product._id", 0] }
                }
            }
        ]);
         //console.log(products)
       
        

           
               res.render("orderDetails", { order: userOrders, products: products ,user:req.session.user._id});
    } catch (error) {
        
    }
}



const cancelIndividualproductOrder = async(req,res)=>{
    try {
        const orderid = req.body.orderid;
        const productDocid = req.body.productDocid;
        const productId = req.body.productid;
        const quantity = parseInt(req.body.quantity);
        const size = req.body.size;
        
        
        
      
     const cancelled = await orderModel.updateOne({_id:new ObjectId(orderid),"products._id":new ObjectId(productDocid) },{$set:{'products.$.status':"cancelled"}})
     
     
         if (cancelled.modifiedCount >0) {
           const  product = await productModel.findOne({_id:new ObjectId(productId)})
           
               if(product.size&& product.size[size]){
               
                 product.size[size].quantity+= quantity
                 
                  await product.save()
                 
                  return res.json({success:true})
               }else{
                res.json({success:false})
               }

             
            
         }else{
            res.json({success:false})
         }
    } catch (error) {
        console.log(error.message)
    }
}



const returnOrder = async(req,res)=>{
    try {
        const productDocid = req.body.productDocid
        const orderid = req.body.orderid
        console.log(productDocid,":productDocid" )
        console.log(orderid,":orderid")
        const productReturn = await orderModel.updateOne({_id:new ObjectId(orderid),"products._id":new ObjectId(productDocid) },{$set:{'products.$.status':"return Pending"}})
        console.log(productReturn)
    } catch (error) {
       console.log(error.message) 
    }
}



const orderController = {
    placeOrder,
    orderPlacedCnfrm,
    orderDetails,
    cancelIndividualproductOrder,
    returnOrder
    
}
module.exports = orderController