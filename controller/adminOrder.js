const orderModel = require("../model/orderModel");
const userModel = require("../model/userModel");
const objectId = require("mongoose").Types.ObjectId;

const orderList = async (req, res) => {
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
    let itemsPerPage = 5
        let currentPage = parseInt(req.query.page) || 1
        let startIndex = (currentPage-1)* itemsPerPage
        let endIndex = startIndex +itemsPerPage
        let totalPages = Math.ceil(usersWhoOrdered.length/itemsPerPage)
        const currentusers = usersWhoOrdered.slice(startIndex,endIndex)
    res.render("adminorderslist", { order: currentusers,totalPages:totalPages,currentPage:currentPage });
  } catch (error) {
    console.log(error.message);
  }
};

const individualOrderDetail = async (req, res) => {
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
    console.log(error.message);
  }
};

const statusUpdating = async (req, res) => {
  try {
    const status = req.query.status;
    const orderid = req.query.orderid;
    const productid = req.query.productid;
    const ordertoUpdateStatus = await orderModel.updateOne(
      {
        _id: new objectId(orderid),
        "products.product": new objectId(productid),
      },
      { $set: { "products.$.status": status } }
    );
    if (ordertoUpdateStatus.matchedCount > 0) {
      res.json({ success: true, message: "status updated" });
    } else {
      res.json({ success: false, message: "could n't update status" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const adminorderController = {
  orderList,
  individualOrderDetail,
  statusUpdating,
};

module.exports = adminorderController;
