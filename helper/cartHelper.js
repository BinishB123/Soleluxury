const cartModel = require("../model/cartModel")
const productModel = require("../model/productModel")
const offerHelper = require("../helper/offerHelper")


const subtotal = (products,userId)=>{
    return new Promise(async(resolve, reject) => {
        
        const userCart = await cartModel.findOne({userId:userId})
         let total =0
         products = await  offerHelper.findOffer(products)
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




const secondsubtotal = (products, userId,qty) => {
    return new Promise(async (resolve, reject) => {
        try {
            // console.log(qty)
            const userCart = await cartModel.findOne({ userId: userId });
            let total = 0;
            
            // Apply offers to products and update products array
            products = await offerHelper.findOffer(products);
            // console.log("//////");
            // console.log(products);
            // console.log("/////////");

            for (let i = 0; i < products.length; i++) {
                // console.log("fuck ",products[i].salePrice);
                const priceAfterDiscount = products[i].salePrice * qty[i];
                total += priceAfterDiscount;
            }

            userCart.totalPrice = parseFloat(total);
            // console.log("userCart.totalPrice", userCart.totalPrice);
            await userCart.save();
            resolve(total);
        } catch (error) {
            console.error("Error in calculating second subtotal:", error);
            reject(error);
        }
    });
};


const cartHelper = {
    subtotal,
    quantityIncrementOrDecrement,
    secondsubtotal
}
module.exports=cartHelper