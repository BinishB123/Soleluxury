const { response } = require("express")
const cartModel = require("../model/cartModel")
const productModel = require("../model/productModel")
const cartHelper = require("../helper/cartHelper")
const {ObjectId} = require('mongodb')

const addToCart = async (req, res) => {
    try {
        if (req.session.user) {

      console.log("call come to add to cart")
            const productId = req.query.id;
            const size = req.query.size
            const userId = req.session.user._id;
            const product = await productModel.findOne({ _id: productId });
            
            const cartItems = {
                productId: productId,
                price: product.salePrice,
                size:size
            };

            const userAlreadyHaveCart = await cartModel.findOne({userId:userId})
            const productAlreadyInTheCart = await cartModel.findOne({
                userId: userId,
                items: {
                    $elemMatch: {
                        productId: productId,
                        size: size 
                    }
                }
            });
            
            
              
             if (userAlreadyHaveCart && !productAlreadyInTheCart) {
                await cartModel.updateOne({userId:userId},
                    { $push: { items: cartItems } }
                 );
                 res.json({ response: true });
                
             } else{
    
            
            const addingToCart = await cartModel.create({
                userId: userId,
                items: [cartItems]
            });
            res.json({ response: true });

            }

        } else {
            
            res.status(401).json({ message: 'Unauthorized: User not logged in' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



const sizeproductChecker = async(req,res)=>{
    try {
        console.log("in  size chcker")
     const userId = req.session.user._id 
     const size = req.query.size
     const productId = req.query.id

        const productAlreadyInTheCartwithClickedSize = await cartModel.findOne({
            userId: userId,
            items: {
                $elemMatch: {
                    productId: productId,
                    size: size 
                }
            }
        });
       // console.log(productAlreadyInTheCartwithClickedSize)
        
              if (productAlreadyInTheCartwithClickedSize) {
                res.json({success:true})
              }else{
                res.json({success:false})
              }

        
    } catch (error) {
        console.log(error.message)
    }
}




const removeProductFromTheCart = async(req,res)=>{
    try {
        const productid = req.query.id;
       
        const size =req.query.size
        
        const userId =req.session.user._id

        const result = await cartModel.updateOne(
            { userId: userId },
            { $pull: { items: { productId: productid, size: size } } }
        );
        

          if (result.modifiedCount>0) {
            res.json({success:true})
          }else{
            res.json({success:false})
          }

    } catch (error) {
        console.log(error.message)
    }
}

const quantityIncrementOrDecrement = async (req, res) => {
    try {
        const productId = req.query.productid;
        const size = req.query.productSize;
        const quantityToDo = req.query.quantity;
        const userId = req.session.user._id;
        const quantityUpdated = await cartHelper.quantityIncrementOrDecrement(userId, productId, quantityToDo, size);
       
     
        
            const userCart = await cartModel.findOne({ userId: userId });
            let products = [];
            
                for (let i = 0; i < userCart.items.length; i++) {
                    const product = await productModel.findById(userCart.items[i].productId);
                    const size = userCart.items[i].size;
                    const quantity = userCart.items[i].quantity;
                    const finalProduct = Object.assign({}, product.toObject(), {
                        size: size
                    }, {
                        quantity: quantity
                    });
                    if (product) {
                        products.push(finalProduct);
                    }
                }
                 const newQuantityprice = await cartHelper.subtotal(products,userId)
                 

               if (quantityUpdated) {
                res.json({ success: true, newquatityPrice: newQuantityprice ,quantity:quantityUpdated,productid:productId,prosize:size});
               }else{
                const oldqty = await cartModel.aggregate([{$match:{userId:new ObjectId(userId)}},{$unwind:'$items'},{$match:{'items.productId':new ObjectId(productId),'items.size':size}},{$project:{'items.quantity':1,_id:0}}])
                console.log(oldqty[0].items.quantity)
                res.json({success:false ,newquatityPrice:newQuantityprice ,quantity:oldqty[0].items.quantity,productid:productId,prosize:size})
               }
                
            
        
    } catch (error) {
        console.log(error.message);
    }
};


const clearingCart = (userId)=>{
    return new Promise(async(resolve, reject) => {
        try {
            const result = await cartModel.deleteOne({userId:userId});
            resolve(result)
        } catch (error) {
            console.log(error.message)
        }
    })
}


            




const cartController ={
    addToCart,
    sizeproductChecker,
    removeProductFromTheCart,
    quantityIncrementOrDecrement,
    clearingCart
}

module.exports = cartController