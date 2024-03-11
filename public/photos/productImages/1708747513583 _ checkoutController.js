const cartModel = require("../model/cartModel")
const userModel = require("../model/userModel")
const productModel = require("../model/productModel")

const checkoutPage = async (req, res) => {
      try {
        const userId = req.session.user._id;
        const user = await userModel.findOne({ _id: userId });
        const userCart = await cartModel.findOne({ userId: userId });
        
        let products = [];
        let subtotal =0
        
        if (userCart) {
            for (let i = 0; i < userCart.items.length; i++) {
                const product = await productModel.findOne({ _id: userCart.items[i].productId });
                const quantity = userCart.items[i].quantity;
                const price = userCart.items[i].price;
                const individualPrice = parseInt(quantity) * parseInt(price);
               
                 subtotal = subtotal+individualPrice
                const finallist = Object.assign({}, product.toObject(), { price: price }, { individualPrice: individualPrice },{quantity:quantity});
                products.push(finallist)
            }
        } 
        
        res.render("checkout", { user: user, products: products,subtotal:subtotal });

        
    } catch (error) {
        console.log(error.message);
    }
};


const checkoutController ={
    checkoutPage
}

module.exports = checkoutController
