const mongoose = require("mongoose");
const product = require("./productModel");

const wishListSchema = mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  items:[{
    product:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "products",
    required: true,
    }
}]
});

const wishlist = mongoose.model("Wishlist", wishListSchema);

module.exports = wishlist;
