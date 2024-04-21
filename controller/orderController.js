const cartModel = require("../model/cartModel");
const productModel = require("../model/productModel");
const userModel = require("../model/userModel");
const placeOrderHelper = require("../helper/placeOrderHelper");
const orderModel = require("../model/orderModel");
const userHelper = require("../helper/userHelper");
const cartController = require("../controller/cartController");
const walletModel = require("../model/walletModel");
const { response } = require("express");
const crypto = require("crypto");
const wallet = require("../model/walletModel");
const easyinvoice = require('easyinvoice');
const { individualOrderDetail, statusUpdating } = require("./adminOrder");
const walletContoller = require("./walletController");
const { log } = require("console");
const ObjectId = require("mongoose").Types.ObjectId;

const placeOrder = async (req, res,next) => {
  try {
    const body = req.body;
    const user = req.session.user._id;
    let flag = false

    if (req.body.paymentMethod === "cashOnDelivery") {
      const placedOrder = await placeOrderHelper.placeOrder(body, user);
      if (placedOrder.status === true) {
        const cartCleared = await cartController.clearingCart(user);
        if (cartCleared) {
          
          res.json({ success: true, url: "/orderplaced" });
        } else {
          res.json({ success: true, message: placedOrder.message });
        }
      }
    } else if (req.body.paymentMethod === "wallet") {
      const placedOrder = await placeOrderHelper.placeOrder(body, user);
      const cart = await cartModel.findOne({ userId: user });
      const amount = cart.totalPrice;
      //  console.log("amount",amount)
      if (placedOrder.status === true) {
        const walletDec = await walletContoller.decrementAmount(user, amount);
         
        const cartCleared = await cartController.clearingCart(user);
        if (cartCleared) {
          res.json({ success: true, url: "/orderplaced" });
        } else {
          res.json({ success: true, message: placedOrder.message });
        }
      }
    } else {
      const userCart = await cartModel.findOne({ userId: user });
      const totalAmount = userCart.totalPrice;
      const checker = await userHelper.generateRazorpay(user, totalAmount);
      // console.log(checker)
      if (checker.success === true) {
        // console.log("ok")
        res.json({ status: true, order: checker.order });
        // flag= true
      } else {
        
        res.json({ status: false });
      }

     
    }
  } catch (error) {
    console.error("Error in placeorder:", error.message);
   
    next(error)
  }
};


const orderPlacedCnfrm = async (req, res) => {
  try {
    res.render("orderplaced");
  } catch (error) {
    console.error("Error in placeordercnfrm:", error);
   
    next(error)
  }
};

const orders = async (req, res,next) => {
  try {
    const userId = req.session.user._id;
    // const userOrders = await orderModel.aggregate([
    //   { $match: { user: new ObjectId(userId) } },
    //   { $sort: { orderedOn: -1 } },
    //   { $unwind: "$products" },
    // ]);
    const userOrders = await orderModel.aggregate([
      { $match: { user: new ObjectId(userId) } },
      { $sort: { orderedOn: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      

    ]);
    //  console.log("userOrders",userOrders)
    // const products = await orderModel.aggregate([
    //   { $match: { user: new ObjectId(userId) } },
    //   { $sort: { orderedOn: -1 } },

    //   {
    //     $lookup: {
    //       from: "products",
    //       localField: "products.product",
    //       foreignField: "_id",
    //       as: "product",
    //     },
    //   },
    //   {
    //     $project: {
    //       productName: { $arrayElemAt: ["$product.productName", 0] },
    //       productImage: { $arrayElemAt: ["$product.productImage", 0] },
    //       _id: { $arrayElemAt: ["$product._id", 0] },
    //     },
    //   },
    // ]);
    //console.log("products",products)
    let itemsPerPage = 5;
    let currentPage = parseInt(req.query.page) || 1;
    let startIndex = (currentPage - 1) * itemsPerPage;
    let endIndex = startIndex + itemsPerPage;
    let totalPages = Math.ceil(userOrders.length / itemsPerPage);
    const currentOrders = userOrders.slice(startIndex, endIndex);
    // const currentProducts = products.slice(startIndex, endIndex);

    res.render("orders", {
      order: currentOrders,
      totalPages: totalPages,
      currentPage: currentPage,
      user: req.session.user._id,
    });
  } catch (error) {
    console.error("Error in orders:", error);
   
    next(error)
  }
};

const cancelIndividualproductOrder = async (req, res,next) => {
  try {
    const orderid = req.body.orderid;
    const productDocid = req.body.productDocid;
    const productId = req.body.productid;
    const quantity = parseInt(req.body.quantity);
    const size = req.body.size;
    const userid = req.session.user._id;
    // const order = await orderModel.aggregate([
    //   {
    //     $match: { _id: new ObjectId(orderid) }
    //   },
    //   {
    //     $unwind: "$products"
    //   },
    //   {$match:{product:produ}}
    // ]);

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
      // const [{ productPrice }] = await orderModel.aggregate([
      //   { $match: { _id: new ObjectId(orderid) } },
      //   { $unwind: "$products" },
      //   { $match: { "products._id": new ObjectId(productDocid) } },
      //   {
      //     $project: {
      //       _id: 0,
      //       productPrice: "$products.productPrice",
      //     },
      //   },
      // ]);

      // const updateTotalAmount = await orderModel.updateOne(
      //   {
      //     _id: new ObjectId(orderid),
      //   },
      //   { $inc: { totalAmount: -productPrice } }
      // );
      

      const [checker] = await orderModel.aggregate([
       {$match:{ _id: new ObjectId(orderid)}},
       {$unwind:"$products"},
       {$match:{"products._id": new ObjectId(productDocid)}},
      ]);
      // console.log
      if (checker.paymentMethod === "razorpay"|| checker.paymentMethod === "wallet") {
        const userHaveWallet = await walletModel.findOne({ userid: userid });
        if (userHaveWallet) {
          const updating = await walletModel.updateOne(
            { userid: userid },
            {
              $push: {
                walletDatas: {
                  amount: checker.products.productPrice,
                  date: new Date(), // Set the current date
                  paymentMethod: checker.paymentMethod, // Set the payment method
                },
              },
              $inc: { balance: checker.products.productPrice *checker.products.quantity},
            }
          );
          // console.log("updatinf in if ", updating);
        } else {
          const creating = await walletModel.create({
            userid: userid,
            balance: checker.products.productPrice,
            walletDatas: [
              {
                amount: checker.products.productPrice *checker.products.quantity,
                date: new Date(),
                paymentMethod: checker.paymentMethod,
              },
            ],
          });
          // console.log("creating in else", creating);
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
    console.error("Error in cacncelorder:", error);
   
    next(error)
  }
};

const returnOrder = async (req, res,next) => {
  try {
    const productDocid = req.body.productDocid;
    const orderid = req.body.orderid;
    // console.log(productDocid, ":productDocid");
    // console.log(orderid, ":orderid");
    const productReturn = await orderModel.updateOne(
      {
        _id: new ObjectId(orderid),
        "products._id": new ObjectId(productDocid),
      },
      { $set: { "products.$.status": "return Pending" } }
    );
    res.json({success:true})
  } catch (error) {
    console.error("Error in returnorder:", error);
   
    next(error)
  }
};

const verifyPayment = async (req, res,next) => {
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
      const placedOrder = await placeOrderHelper.razoPlaceOrder(body, user);
      // console.log("placed");
      if (placedOrder.status === true) {
        // console.log("placedOrder", placeOrder);
        const cartCleared = await cartController.clearingCart(user);
        // console.log("cartclearing");
        if (cartCleared) {
          // console.log("cartclearing", cartCleared);
          res.json({ success: true, url: "/orderplaced" });
        }
      } else {
        res.json({ success: true, message: placedOrder.message });
      }
    } else {
      // console.log("Payment verification failed");
      res
        .status(400)
        .json({ success: false, message: "Payment verification failed" });
    }
  } catch (error) {
    console.error("Error in verifypayment:", error);
   
    next(error)
  }
};


const invoiceDownload = async(req,res,next)=>{
  try {
    const productDocId = req.body.productDocid
    const orderId = req.body.orderid
    // console.log("productDocId",productDocId)
    // console.log("orderId",orderId)
    const [ individualOrder ] = await orderModel.aggregate([
      {$match:{_id: new ObjectId(orderId)}},
      {$unwind:"$products"},
      {$match:{"products._id":new ObjectId(productDocId)}},
      {$lookup:{
        from:"products",
        localField:"products.product",
        foreignField:"_id",
        as:"prod"
      }},
      {$unwind:"$prod"}
    ]);
       if (individualOrder) {
        res.status(200).json({ data: individualOrder });
       }
    
  } catch (error) {
    console.error("Error in invoice:", error);
   
    next(error)
    
  }
}


const orderdetails =  async(req,res,next)=>{
  try {
    const id = req.query.id
    // console.log("okkk",id)
     const products = await orderModel.aggregate([
      { $match: { _id: new ObjectId(id) } },
      { $sort: { orderedOn: -1 } },
      {$unwind:"$products"},
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "product",
        },
      },
      {$unwind:"$product"},
      // {
      //   $lookup: {
      //     from: "coupons",
      //     localField: "coupon",
      //     foreignField: "_id",
      //     as: "co",
      //   },
      // },
      // {$unwind:"$co"}
    ]);
    const prod = await orderModel.aggregate([
      { $match: { _id: new ObjectId(id) } },
      { $sort: { orderedOn: -1 } },
      {$unwind:"$products"},
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "product",
        },
      },
      {$unwind:"$product"},
      {
        $lookup: {
          from: "coupons",
          localField: "coupon",
          foreignField: "_id",
          as: "co",
        },
      },
      {$unwind:"$co"}
    ]);
    //  console.log("orderdetails",prod)
    res.render("orderDetails",
    {order:products,user:req.session.user._id,prod:prod})
    
  } catch (error) {
    console.error("Error in orderdetail:", error);
   
    next(error)
  }
}

const paymentFaliure = async(req,res)=>{
  try {
    const body = req.body;
    console.log(body)
    const user = req.session.user._id;
    console.log("yeah call comming")
    const placedOrder =  await placeOrderHelper.paymentFailure(body,user)
    console.log("placeorder",placedOrder)
    if (placedOrder.status === true) {
      const cartCleared = await cartController.clearingCart(user);
      if (cartCleared) {
        // console.log("okkkk")
        res.json({ success: true, url: "/paymentFailOrder" });
      } else {
        res.json({ success: true, message: placedOrder.message });
      }
    }
    
    
  } catch (error) {
    console.error("Error in paymentfailure:", error);
   
    // next(error)
  }
}

const paymentFailOrder= async(req,res)=>{
  try{
    res.render("paymentFailOrder")

  }catch(error){
    console.error("Error in paymentfailure order:", error);
   
    next(error)
  }
}

const retrypayment = async(req,res)=>{
  try {
    const user = req.session.user._id;
    const totalAmount =parseInt( req.body.amount)
    // console.log(user,totalAmount)
    const checker = await userHelper.generateRazorpay(user, totalAmount);
    if (checker.success === true) {
      // console.log("ok")
      res.json({ status: true, order: checker.order });
      // flag= true
    } else {
      
      res.json({ status: false });
    }
    
  } catch (error) {
    console.log(error.message)
    next(error)
  }
}

const verifyfailure = async (req, res) => {
  try {
    const payment = req.body.payment;
    const body = req.body.data; // Move body declaration here
    // console.log(body); // Log body here
    const orderId = req.body.order.id;
    // console.log("orderId", orderId);
    const id = req.body.orderdocid;
   // console.log("orderdocid", id);
    const documentOrderId = req.body.documentOrderId;

    const user = req.session.user._id;

    const secret = "p82tQtMSPH6JUUjE7vwvh4HQ";
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(orderId + "|" + payment.razorpay_payment_id)
      .digest("hex");

    if (generatedSignature === payment.razorpay_signature) {
      const orderStatus = await orderModel.findOne({
        _id: new ObjectId(id),
      });
      console.log(orderStatus)
      for (let i = 0; i < orderStatus.products.length; i++) {
        const productDocid = orderStatus.products[i]._id; // Assuming _id is stored in productDocid
        const statusupdate = await orderModel.updateOne(
          {
            _id: new ObjectId(id),
            "products._id": new ObjectId(productDocid),
          },
          { 
            $set: { 
              [`products.${i}.status`]: "Confirmed", // Update the status of each product
            },
          }
        );
        console.log(statusupdate)
      }
      await orderModel.updateOne(
        { _id: new ObjectId(id) },
        { $set: { "currentstatus": "Confirmed" } }
      );
      

      res.json({ success: true });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Payment verification failed" });
    }
  } catch (error) {
    console.error("Error in category:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};





const orderController = {
  placeOrder,
  orderPlacedCnfrm,
  orders,
  cancelIndividualproductOrder,
  returnOrder,
  verifyPayment,
  invoiceDownload,
  orderdetails,
  paymentFaliure,
  paymentFailOrder,
  retrypayment,
  verifyfailure
};
module.exports = orderController;
