const orderModel = require("../model/orderModel");
const userModel = require("../model/userModel");
const walletModel = require("../model/walletModel");
const objectId = require("mongoose").Types.ObjectId;

const orderList = async (req, res,next) => {
  try {
    const usersWhoOrdered = await orderModel.aggregate([
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
    let itemsPerPage = 5;
    let currentPage = parseInt(req.query.page) || 1;
    let startIndex = (currentPage - 1) * itemsPerPage;
    let endIndex = startIndex + itemsPerPage;
    let totalPages = Math.ceil(usersWhoOrdered.length / itemsPerPage);
    const currentusers = usersWhoOrdered.slice(startIndex, endIndex);
    res.render("adminorderslist", {
      order: currentusers,
      totalPages: totalPages,
      currentPage: currentPage,
    });
  } catch (error) {
    console.error("Error in logout:", error);
    
    next(error)
  }
};

const individualOrderDetail = async (req, res,next) => {
  try {
    const orderId = req.query.id;

    const order = await orderModel.aggregate([
      { $match: { _id: new objectId(orderId) } },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
    ]);

    res.render("adminOrderDetail", { order: order });
  } catch (error) {
    console.error("Error in logout:", error);
    
    next(error)
  }
};

const statusUpdating = async (req, res,next) => {
  try {
    const status = req.query.status;
    const orderid = req.query.orderid;
    const productid = req.query.productid;
    const productDocId = req.query.productDocId;
    const order = await orderModel.findOne({ _id: new objectId(orderid) });
    const ordertoUpdateStatus = await orderModel.updateOne(
      {
        _id: new objectId(orderid),
        "products.product": new objectId(productid),
      },
      { $set: { "products.$.status": status } }
    );
    if (ordertoUpdateStatus.matchedCount > 0) {
      const [{ productStatus }] = await orderModel.aggregate([
        { $match: { _id: new objectId(orderid) } },
        { $unwind: "$products" },
        { $match: { "products._id": new objectId(productDocId) } },
        {
          $project: {
            _id: 0,
            productStatus: "$products.status", 
          },
        },
      ]);

      if (productStatus === "Returned") {
        const [{ productPrice }] = await orderModel.aggregate([
          { $match: { _id: new objectId(orderid) } },
          { $unwind: "$products" },
          { $match: { "products._id": new objectId(productDocId) } },
          {
            $project: {
              _id: 0,
              productPrice: "$products.productPrice",
            },
          },
        ]);

        const updateTotalAmount = await orderModel.updateOne(
          {
            _id: new objectId(orderid),
          },
          { $inc: { totalAmount: -productPrice } }
        );
        // console.log(updateTotalAmount);

        const checker = await orderModel.findOne({
          _id: new objectId(orderid),
          "products._id": new objectId(productDocId),
        });

        const userHaveWallet = await walletModel.findOne({
          userid: new objectId(order.user),
        });
        if (userHaveWallet) {
          const updating = await walletModel.updateOne(
            { userid: new objectId(order.user) },
            {
              $push: {
                walletDatas: {
                  amount: checker.products[0].productPrice,
                  date: new Date(), // Set the current date
                  paymentMethod: checker.paymentMethod, // Set the payment method
                },
              },
              $inc: { balance: checker.products[0].productPrice },
            }
          );
          // console.log("updatinf in if ", updating);
        } else {
          const creating = await walletModel.create({
            userid: new objectId(order.user),
            balance: checker.products[0].productPrice,
            walletDatas: [
              {
                amount: checker.products[0].productPrice,
                date: new Date(),
                paymentMethod: checker.paymentMethod,
              },
            ],
          });
          // console.log("creating in else", creating);
        }
      }

      res.json({ success: true, message: "status updated" });
    } else {
      res.json({ success: false, message: "could n't update status" });
    }
  } catch (error) {
    console.error("Error in logout:", error);
    
    next(error)
  }
};

const adminorderController = {
  orderList,
  individualOrderDetail,
  statusUpdating,
};

module.exports = adminorderController;
