const cartModel = require("../model/cartModel")
const productModel = require("../model/productModel")

const subtotal = (products,userId)=>{
    return new Promise(async(resolve, reject) => {
        const userCart = await cartModel.findOne({userId:userId})
         let total =0
         
         for(let i=0;i< products.length;i++){
            total = total + products[i].salePrice*products[i].quantity
         }
        
        userCart.totalPrice=parseFloat(total)
        await userCart.save()

        resolve(total) 

    })
}

const quantityIncrementOrDecrement = (userId,productId,quantity,Size)=>{
    return new Promise(async(resolve, reject) => {
          const productid = productId
          const quantityToDo = parseInt(quantity)
          const size = Size

          const cart = await cartModel.findOne({userId:userId})
          const  product = cart.items.find((item)=>{
            return  item.productId.toString()===productId.toString() && item.size===size
          })
           
          let newQuantity = product.quantity +quantityToDo
          
          if (newQuantity<1) {
             newQuantity =1    
          }
          const productToCheck = await  productModel.findOne({_id:productid})
             if (newQuantity > productToCheck.size[Size].quantity) {
                 resolve(false)
                 return;
             }else{              
                product.quantity = newQuantity
                await cart.save()
                resolve(newQuantity)
             }
            

         
         
         
       
    })
}


const cartHelper = {
    subtotal,
    quantityIncrementOrDecrement
}
module.exports=cartHelper