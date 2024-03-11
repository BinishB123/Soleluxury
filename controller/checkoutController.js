const cartModel = require("../model/cartModel");
const userModel = require("../model/userModel");
const productModel = require("../model/productModel");
const couponModel = require("../model/couponModel");
const cartHelper = require("../helper/cartHelper");
const offerHelper = require("../helper/offerHelper");

const checkoutPage = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const user = await userModel.findOne({ _id: userId });
    const userCart = await cartModel.findOne({ userId: userId });

    let products = [];
    let subtotal = 0;
    let productTosubTotal = [];
    let qty=[]
    if (userCart) {
      for (let i = 0; i < userCart.items.length; i++) {
        const product = await productModel.findOne({
          _id: userCart.items[i].productId,
        });
        const item = await offerHelper.productViewOffer(product)
        
        
       

        productTosubTotal.push(item);

        const quantity = userCart.items[i].quantity;
       qty.push( userCart.items[i].quantity)

        const individualPrice = parseInt(quantity) * parseInt(item.salePrice);

        subtotal += individualPrice;

        const finallist = Object.assign(
          {},
          product.toObject(),
          { salePrice: item.salePrice },
          { individualPrice: individualPrice },
          { quantity: quantity }
        );
        products.push(finallist);
      }
    }
    // console.log("products",productTosubTotal)
    const updateTotalPricePromise = await cartHelper.secondsubtotal(
      productTosubTotal,
      userId,
      qty
    );

    const coupons = await couponModel.find({ usedByUser: { $nin: [userId] } });
     console.log(updateTotalPricePromise)
    console.log("userCart||||||", userCart.totalPrice);
    res.render("checkout", {
      user: user,
      products: products,
      cart:updateTotalPricePromise ,
      coupons: coupons,
    });
  } catch (error) {
    console.error("Error in checkoutPage:", error);
    res.status(500).send("Internal Server Error");
  }
};




const checkoutController = {
  checkoutPage,
};

module.exports = checkoutController;
