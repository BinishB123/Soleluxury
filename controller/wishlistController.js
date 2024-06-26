const offerHelper = require("../helper/offerHelper");
const product = require("../model/productModel");
const { findById } = require("../model/userModel");
const wishlistModel = require("../model/wishlistModel");
const ObjectId = require("mongoose").Types.ObjectId;

const whistlistPage = async (req, res,next) => {
  try {
    // console.log("ok")
     const userid = req.session.user._id
      // console.log(userid)
    const wishlist = await wishlistModel.aggregate([
       {$match:{userid:new ObjectId( userid)}},
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
  //  console.log(wishlist)
    
    const products = await offerHelper.secondfindOffer(wishlist)
    
    res.render("wishlist", { wishlist: products });
  } catch (error) {
    console.error("Error in  wishlist:", error);
   
    next(error)
  }
};

const addToWishlist = async (req, res,next) => {
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
    
    // console.log(productAlreadyInWishlist)
    if (productAlreadyInWishlist) {
      res.json({ status: false });
      return;
    }

    const userAlreadyHavewishlist = await wishlistModel.findOne({
      userid: userId,
    });

    if (!productAlreadyInWishlist && userAlreadyHavewishlist) {
      // console.log("ok")
      await wishlistModel.findOneAndUpdate(
        { userid: userId },
        { $addToSet: { items: { product: productId } } },
        { new: true, upsert: true }
      );
      res.json({ status: true });
    } else {
      // console.log("ok2")
      await wishlistModel.create({
        userid: userId,
        items: [{ product: productId }],
      });
      res.json({ status: true });
    }
  } catch (error) {
    console.error("Error in  addtowishlist:", error);
   
    next(error)
  }
};

const removeWishlist = async (req, res,next) => {
  try {
    const productid = req.query.id;
    const userId = req.session.user._id;
    const removed = await wishlistModel.findOneAndUpdate(
      { userid: userId },
      { $pull: { items: { product: productid} } },
      { new: true }
    );
    if (removed.modifiedCount > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    console.error("Error in  remove form wishlist:", error);
   
    next(error)
  }
};
 
const wishlistController = {
  whistlistPage,
  addToWishlist,
  removeWishlist,  
};

module.exports = wishlistController;
  