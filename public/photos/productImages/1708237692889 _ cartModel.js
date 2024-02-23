const mongoose = require("mongoose")
const cartSchema = mongoose.Schema({
    userId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"user",
      required:true,

    },
    items:[{
        productId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"products",
            required:true
        },
        quantity:{
            type:Number,
            default:1
            
        },
        price:{
            type:Number,
            required:true
            
        },
        size:{
            type:String,
            required:true
        },
        
    }],
    createAt:{type:Date,default:Date.now},
    totalPrice:{
        type:Number
    }
})
const cart = mongoose.model("Cart",cartSchema) 
module.exports = cart