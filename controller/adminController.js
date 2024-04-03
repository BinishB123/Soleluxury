const Admin = require("../model/adminModel");
const orderModel = require("../model/orderModel");
const DateHelper = require("../helper/dateHelper");

const loginload = async (req, res, next) => {
  try {
    if (req.session.admin) {
      res.redirect("/admin/adminhome");
    } else {
      const message = req.flash("errorMessage");
      res.render("adminlogin", { errorMessage: message });
    }
  } catch (error) {
    console.error("Error in loginload:", error);
    
    next(error); // Pass the error to the next error-handling middleware
  }
};

const adminlogin = async (req, res,next) => {
  try {
    // console.log("admin login load", req.body.email);
    const admin = await Admin.findOne({ email: req.body.email });

    // console.log(admin);

    if (admin) {
      // console.log(" /////")
      // console.log(admin.email)
      // console.log(admin.password)
      // console.log('///')
      // console.log( req.body.password)

      if (admin.password === req.body.password) {
        // console.log( req.body.password)
        req.session.admin = admin;
        res.redirect("/admin/adminhome");
      } else {
        req.flash("errorMessage", "invalid emailid or password");
        res.redirect("/admin");
        console.log("password incorrect");
      }
    } else {
      req.flash("errorMessage", "invalid emailid or password");
      res.redirect("/admin");
    }
  } catch (error) {
    console.log("Error in  admin login: " + error);
    
    next(error)
  }
};

const adminhome = async (req, res,next) => {
  try{
  if (req.session.admin) {
    const category = await orderModel.aggregate([
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "prod",
        },
      },
      { $unwind: "$prod" },
      {
        $lookup: {
          from: "categories",
          localField: "prod.category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    const orders = await orderModel.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.status",
          count: { $sum: 1 },
        },
      },
    ]);

    const brand = await orderModel.aggregate([
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "prod",
        },
      },
      { $unwind: "$prod" },
      {
        $group: {
          _id: "$prod.brand",
          count: { $sum: 1 },
        },
      },
    ]);

    const currentYear = new Date().getFullYear();

    const salesReport = await orderModel.aggregate([
      { $unwind: "$products" },
      {
        $match: {
          "products.status": "delivered",
          $expr: {
            $eq: [{ $year: "$orderedOn" }, currentYear],
          },
        },
      },
      {
        $group: {
          _id: { $month: "$orderedOn" },
          totalAmount: { $sum: "$products.productPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const yearlyReport = await orderModel.aggregate([
      { $unwind: "$products" },
      { $match: { "products.status": "delivered" } },
      {
        $group: {
          _id: { $year: "$orderedOn" },
          totalAmount: { $sum: "$products.productPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const bestSellingProduct = await orderModel.aggregate([
      { $unwind: "$products" },
      { $match: { "products.status": "delivered" } },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $group: {
          _id: "$product",
          productName: { $first: "$product.productName" },
          totalCount: { $sum: "$products.quantity" },
        },
      },
      { $sort: { totalCount: -1 } },
      { $limit: 10 },
    ]);

    // let currentDate = new Date();
    // let currentMonth = currentDate.getMonth(); // This will return the month (0-indexed)
    // const currentYe = currentDate.getFullYear();
    // const weeksWithDates = await DateHelper.getWeeksOfMonth(
    //   currentYe,
    //   currentMonth
    // );
    // const Dates = weeksWithDates.flat();
    // let weeklyDatas = [];
    // let DatNum = [];
    // for (let i = 0; i < Dates.length; i++) {
    //   const startDate = Dates[i];
    //   const endDate = Dates[i + 1]; // Assuming Dates is an array of date strings
    //   DatNum.push(i + 1);

    //   const Datas = await orderModel.aggregate([
    //     { $unwind: "$products" },
    //     {
    //       $match: {
    //         "products.status": "delivered",
    //         orderedOn: { $gte: new Date(startDate), $lt: new Date(endDate) },
    //       },
    //     },
    //     {
    //       $group: {
    //         _id: "$orderId",
    //         totalAmount: { $sum: "$products.productPrice" },
    //         totalProducts: { $sum: 1 },
    //       },
    //     },
    //   ]);

    //   weeklyDatas.push(Datas);
    // }

    // weeklyDatas = weeklyDatas.flat();
    // const weekly = {
    //   weeklyDatas,
    //   DatNum,
    // };
    // console.log("This is yearly report: ",yearlyReport)
    // console.log("This is category: ",category);
    // console.log("This is brand: ",brand);
    // console.log("This is salesreport: ",salesReport);
    // console.log("This is yearlyReport:",yearlyReport);
    // console.log("This is bestselling product", bestSellingProduct);
    // console.log(weeklyDatas)
    res.render("adminhome", {
      category: category,
      order: orders,
      brand: brand,
      salesReport: salesReport,
      yearlyReport: yearlyReport,
      bestSellingProduct: bestSellingProduct,
      
    });
  } else {
    res.redirect("/admin");
  }
}catch(error){
    console.error("Error in adminhome:", error);
    
    next(error)
}
};

const logout = (req, res,next) => {
  try {
    req.session.admin = null;
    res.redirect("/admin");
  } catch (error) {
    console.error("Error in logout:", error.message);
    
    next(error)
  }
};

const adminController = {
  loginload,
  adminlogin,
  adminhome,
  logout,

  // sendOtp,
  //verify
};

module.exports = adminController;
