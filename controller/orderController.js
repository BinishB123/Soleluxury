const cartModel = require("../model/cartModel");
const productModel = require("../model/productModel");
const userModel = require("../model/userModel");
const placeOrderHelper = require("../helper/placeOrderHelper");
const orderModel = require("../model/orderModel");
const userHelper = require("../helper/userHelper");
const cartController = require("../controller/cartController");
const walletModel = require("../model/walletModel")
const { response } = require("express");
const crypto = require("crypto");
const wallet = require("../model/walletModel");
const ObjectId = require("mongoose").Types.ObjectId;

const placeOrder = async (req, res) => {
  try {
    const body = req.body;
    const user = req.session.user._id;

    if (req.body.paymentMethod === "cashOnDelivery") {
      const placedOrder = await placeOrderHelper.placeOrder(body, user);
      if (placedOrder.status === true) {
        const cartCleared = await cartController.clearingCart(user);
        if (cartCleared) {
          res.json({ success: true, url: "/orderplaced" });
        }
      } else {
        res.json({ success: true, message: placedOrder.message });
      }
    } else {
      const userCart = await cartModel.findOne({ userId: user });
      const totalAmount = userCart.totalPrice;

      const checker = await userHelper.generateRazorpay(user, totalAmount);
      if (checker.success === true) {
        res.json({ status: true, order: checker.order });
      } else {
        res.json({ status: false });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.json({ status: false, error: error.message });
  }
};

const orderPlacedCnfrm = async (req, res) => {
  try {
    res.render("orderplaced");
  } catch (error) {}
};

const orderDetails = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const userOrders = await orderModel.aggregate([
      { $match: { user: new ObjectId(userId) } },
      { $sort: { orderedOn: -1 } },
      { $unwind: "$products" },
    ]);

    const products = await orderModel.aggregate([
      { $match: { user: new ObjectId(userId) } },
      { $sort: { orderedOn: -1 } },
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $project: {
          productName: { $arrayElemAt: ["$product.productName", 0] },
          productImage: { $arrayElemAt: ["$product.productImage", 0] },
          _id: { $arrayElemAt: ["$product._id", 0] },
        },
      },
    ]);
    //console.log(products)
    let itemsPerPage = 5
        let currentPage = parseInt(req.query.page) || 1
        let startIndex = (currentPage-1)* itemsPerPage
        let endIndex = startIndex +itemsPerPage
        let totalPages = Math.ceil(userOrders.length/itemsPerPage)
        const currentOrders = userOrders.slice(startIndex,endIndex)
        const currentProducts = products.slice(startIndex,endIndex)

    res.render("orderDetails", {
      order: currentOrders,
      products: currentProducts,
      totalPages:totalPages,
      currentPage:currentPage,
      user: req.session.user._id,
    });
  } catch (error) {}
};

const cancelIndividualproductOrder = async (req, res) => {
  try {
    const orderid = req.body.orderid;
    const productDocid = req.body.productDocid;
    const productId = req.body.productid;
    const quantity = parseInt(req.body.quantity);
    const size = req.body.size;
    const userid = req.session.user._id
    const cancelled = await orderModel.updateOne(
      {
        _id: new ObjectId(orderid),
        "products._id": new ObjectId(productDocid),
      },
      { $set: { "products.$.status": "cancelled" } }
    );

    if (cancelled.modifiedCount > 0) {
      const product = await productModel.findOne({
        _id: new ObjectId(productId),
      });

 
      const checker = await orderModel.findOne(
        {
          _id: new ObjectId(orderid),
          "products._id": new ObjectId(productDocid),
        })
      if (checker.paymentMethod==="razorpay") {
          const userHaveWallet = await walletModel.findOne({userid:userid})
              if(userHaveWallet){
                const updating = await walletModel.updateOne(
                  { userid: userid },
                  {
                    $push: {
                      walletDatas: {
                        amount: checker.products[0].productPrice, // Set the actual amount value here
                        date: new Date(), // Set the current date
                        paymentMethod: checker.paymentMethod, // Set the payment method
                      },
                    },
                    $inc: { balance: checker.products[0].productPrice  } 
                  }
                   
                );
                console.log("updatinf in if ",updating)     
                }else{
                  const creating = await walletModel.create({
                    userid: userid,
                    balance: checker.products[0].productPrice,
                    walletDatas: [
                      {
                        amount: checker.products[0].productPrice,
                        date: new Date(),
                        paymentMethod: checker.paymentMethod,
                      },
                    ],
                  });
                  console.log("creating in else",creating)
                }
              }
      

      if (product.size && product.size[size]) {
        product.size[size].quantity += quantity;

        await product.save();

        return res.json({ success: true });
      } else {
        res.json({ success: false });
      }
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const returnOrder = async (req, res) => {
  try {
    const productDocid = req.body.productDocid;
    const orderid = req.body.orderid;
    console.log(productDocid, ":productDocid");
    console.log(orderid, ":orderid");
    const productReturn = await orderModel.updateOne(
      {
        _id: new ObjectId(orderid),
        "products._id": new ObjectId(productDocid),
      },
      { $set: { "products.$.status": "return Pending" } }
    );
    console.log(productReturn);
  } catch (error) {
    console.log(error.message);
  }
};

const verifyPayment = async (req, res) => {
  try {
    const payment = req.body.payment;
    const orderId = req.body.order.id;
    const documentOrderId = req.body.documentOrderId;
    const body = req.body.data;

    const user = req.session.user._id;
    

    const secret = "p82tQtMSPH6JUUjE7vwvh4HQ";
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(orderId + "|" + payment.razorpay_payment_id)
      .digest("hex");

      if (generatedSignature === payment.razorpay_signature) {
        // console.log("Payment is successful");
        const placedOrder = await placeOrderHelper.placeOrder(body, user);
        // console.log("placed");
        if (placedOrder.status === true) {
          // console.log("placedOrder", placeOrder);
          const cartCleared = await cartController.clearingCart(user);
          console.log("cartclearing");
          if (cartCleared) {
             console.log("cartclearing", cartCleared);
            res.json({ success: true, url: "/orderplaced" });
          }
        } else {
          res.json({ success: true, message: placedOrder.message });
        }
      } else {
        // console.log("Payment verification failed");
        res.status(400).json({ success: false, message: "Payment verification failed" });
      }
      
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const orderController = {
  placeOrder,
  orderPlacedCnfrm,
  orderDetails,
  cancelIndividualproductOrder,
  returnOrder,
  verifyPayment,
};
module.exports = orderController;
