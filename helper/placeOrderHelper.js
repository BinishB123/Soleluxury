const cartModel = require("../model/cartModel");
const orderModel = require("../model/orderModel");
const productModel = require("../model/productModel");
const couponHelper = require("../helper/couponHelper")
const userModel = require("../model/userModel");
const offerHelper = require("../helper/offerHelper")
const couponModel = require("../model/couponModel")
const placeOrder = (body, userId) => {
  return new Promise(async (resolve, reject) => {
    
    try {
      // console.log("im here at place order");
      // console.log(body)
      
      const couponId = body.couponId
      const userCart = await cartModel.findOne({ userId: userId });
      const user = await userModel.findOne({ _id: userId });
      const orderAddress = user.address.find((address) => {
        return address._id.toString() === body.addressId;
      });

      let response ={}
 
      for (let item of userCart.items) {
        const product = await productModel.findOne({ _id: item.productId });
        if (product.size[item.size].quantity < item.quantity) {
          response.status = false;
          response.message = `Insufficient quantity for product ${product.productName}`;
          resolve(response);
          return;
        }
      }

      let products = [];
    
      for (let i of userCart.items) {
        const product = await productModel.findOne({ _id: i.productId });
        const prod = await offerHelper.productViewOffer(product)// sale price offer edukan if any porduct offer indenkil
        let orginalprice  /// if any coupon applied and after calucluated with the prod price will assign to this
        if (couponId!=undefined) {
          const coupon=await couponModel.findOne({_id:couponId})
          // console.log("coupon kitti", coupon)
          const discount=coupon.discount
          orginalprice=prod.salePrice-(prod.salePrice/100)*discount  
        }else{
          orginalprice = prod.salePrice
        }
        products.push({
          product: i.productId,
          productPrice: orginalprice,
          size: i.size,
          quantity: i.quantity,
        });

        
        const changeProductQuantity = await productModel.findOne({
          _id: i.productId,  
        });
        changeProductQuantity.size[i.size].quantity -= i.quantity;
        await changeProductQuantity.save();
      }

      if (userCart && orderAddress) {
        if(couponId!=undefined){
          const orderPlacing = await orderModel.create({
            user: userId,
            products: products,
            address: {
              name: orderAddress.name,
              mobile: orderAddress.mobile,
              house: orderAddress.housName,
              city: orderAddress.CityOrTown,
              pincode: orderAddress.pincode,
              state: orderAddress.state,
              country: orderAddress.country,
            },
            paymentMethod: body.paymentMethod,
            totalAmount: userCart.totalPrice,
            coupon:couponId
          });
        }else{
        const orderPlacing = await orderModel.create({
          user: userId,
          products: products,
          address: {
            name: orderAddress.name,
            mobile: orderAddress.mobile,
            house: orderAddress.housName,
            city: orderAddress.CityOrTown,
            pincode: orderAddress.pincode,
            state: orderAddress.state,
            country: orderAddress.country,
          },
          paymentMethod: body.paymentMethod,
          totalAmount: userCart.totalPrice,
        });
      }
       //console.log("order placing",orderPlacing._id)
       
       if (couponId!=undefined) {
        
         const addingCouponUsedUser = await couponHelper.addingCouponUsedUser(couponId,userId)
        //  console.log("addd",addingCouponUsedUser)
         if(addingCouponUsedUser){
           response.status = true;
  
        resolve(response);
         }
          
       }else{
        response.status = true;
        resolve(response);
       }
       
       
      }
    } catch (error) {
      console.log(error.message);
    }
  });
};

const placeOrderHelper = {
  placeOrder,
};

module.exports = placeOrderHelper;
