const mongoose  = require("mongoose");

const brandSchema = mongoose.Schema({
    brandName:{
        type:String,
        required:true
    },
    brandImage:{
        type:Array,
       
    },
    isBlocked:{
        type:Boolean,
        default:false
    }
})
const brand = mongoose.model("brands",brandSchema)
module.exports = brand