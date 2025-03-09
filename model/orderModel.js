const mongoose = require("mongoose")
const orderSchema = new mongoose.Schema({
    user:{
        type:mongoose.Types.ObjectId,
        ref:"user"
    },


    products:[{
        product:{
            type:mongoose.Types.ObjectId,
            ref:"products"
        },
        quantity:{
            type:Number
        },
        size:{
            type:String
        },
        productPrice:{
           type:Number
        },
        status:{
            type:String,
             enum:["pending","Proccessing","Confirmed","OutForDelivery","Shipped","Delivered","cancelled","return Pending","Return","Returned","payment pending"],
            // default:"pending",
          }

        }
      ],
    
    
    
   address:{
        name:String,
        house:String,
        state:String,
        country:String,
        city:String,
        pincode:Number,
        mobile:Number
    },
    paymentMethod:{
        type:String,
        required:true
    },
    orderedOn:{
        type:Date,
        default:Date.now
    },
    deliveredOn:{
        type:Date
    },
   currentstatus:{
        type:String,
           enum:["payment pending","confirm"],
          default:"confirm"
    },
    orderId:{
        type:Number,
        default:()=> Math.floor(1000+Math.random()*80000),
    },
    totalAmount:{
        type:Number
    },
    coupon:{
        type:mongoose.Types.ObjectId,
            ref:"coupons"
    }
})




const order = mongoose.model("orders",orderSchema)
module.exports = order
