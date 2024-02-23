const cartModel = require("../model/cartModel")
const orderModel = require("../model/orderModel")
const productModel = require("../model/productModel")
const userModel = require("../model/userModel")



const placeOrder = (body,userId)=>{
    return new Promise(async(resolve, reject) => {
        try {
            
            const userCart =  await cartModel.findOne({userId:userId});
             const user = await userModel.findOne({_id:userId})
             const orderAddress = user.address.find((address)=>{
               return address._id.toString()=== body.addressId
             })
                  

             let products =[]

             for (let i of  userCart.items) {
                          products.push({
                              product:i.productId,
                              price:i.price,
                              size:i.size,
                              quantity:i.quantity
                          })
                                 
                         //product quantity changing in product model
                          const changeProductQuantity = await productModel.findOne({_id:i.productId})
                          changeProductQuantity.size[i.size].quantity -= i.quantity
                          await changeProductQuantity.save()


             }
             if (userCart&&orderAddress) {
                const orderPlacing = await orderModel.create({
                    user:userId,
                    products:products,
                    address:{
                        name:orderAddress.name,
                        mobile:orderAddress.mobile,
                        house:orderAddress.housName,
                        city:orderAddress.CityOrTown,
                        pincode:orderAddress.pincode,
                        state:orderAddress.state,
                        country:orderAddress.country,
                        
                        
                       
                    },
                    paymentMethod:body. paymentMethod, 
                    totalAmount:userCart.totalPrice
                    
                }) 
                resolve(orderPlacing)
             }
            

             
             
            
        } catch (error) {
          console.log(error.message)  
        }
    })
}





const placeOrderHelper ={
    placeOrder
}

module.exports = placeOrderHelper