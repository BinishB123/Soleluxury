const offerHelper = require("../helper/offerHelper");
const product = require("../model/productModel");
const { findById } = require("../model/userModel");
const wishlistModel = require("../model/wishlistModel");

const whistlistPage = async (req, res) => {
  try {
    const wishlist = await wishlistModel.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
    ]);

    
    const products = await offerHelper.secondfindOffer(wishlist)
    // for(let i =0;i< products.length;i++){
    //   console.log("wishlist",products[i])
    // }
    res.render("wishlist", { wishlist: products });
  } catch (error) {
    console.log(error.message);
  }
};

const addToWishlist = async (req, res) => {
  try {
    const productId = req.query.id;
    const userId = req.session.user._id;

    const productAlreadyInWishlist = await wishlistModel.findOne({
      userid: userId,
      items: {
        $elemMatch: {
          product: productId,
        },
      },
    });
    if (productAlreadyInWishlist) {
      res.json({ status: false });
      return;
    }

    const userAlreadyHavewishlist = await wishlistModel.findOne({
      userid: userId,
    });

    if (!productAlreadyInWishlist && userAlreadyHavewishlist) {
      await wishlistModel.updateOne({
        $push: { items: { product: productId } },
      });
      res.json({ status: true });
    } else {
      await wishlistModel.create({
        userid: userId,
        items: [{ product: productId }],
      });
      res.json({ status: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const removeWishlist = async (req, res) => {
  try {
    const productid = req.query.id;
    const userId = req.session.user._id;
    const removed = await wishlistModel.updateOne(
      { userid: userId },
      { $pull: { items: { product: productid } } }
    );
    if (removed.modifiedCount > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const wishlistController = {
  whistlistPage,
  addToWishlist,
  removeWishlist,
};

module.exports = wishlistController;
