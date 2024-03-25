const orderModel = require("../model/orderModel");
const couponModel = require("../model/couponModel");

const salesReportPage = async (req, res) => {
  try {
    const day = req.query.day;
    const customDate = day ? new Date(day) : null;

    let ordersWithCustomerInfo;
    if (customDate) {
      ordersWithCustomerInfo = await fetchOrdersForDay(customDate);
    } else {
      ordersWithCustomerInfo = await fetchOrdersWithoutDay();
    }

    // Sorting orders by month
    ordersWithCustomerInfo.sort((a, b) => {
      const monthA = new Date(a.orderedOn).getMonth();
      const monthB = new Date(b.orderedOn).getMonth();
      return monthA - monthB;
    });

    for (const order of ordersWithCustomerInfo) {
      if (order.coupon) {
        const couponValue = order.coupon;
        const couponDocument = await couponModel.findOne({
          _id: couponValue,
        });
        if (couponDocument) {
          const couponDiscount = couponDocument.discount;
          order.couponDiscount = couponDiscount;
        } else {
          order.couponDiscount = "no coupon";
        }
      }
    }

    const filteredInfos = filterOrders(ordersWithCustomerInfo);
    const paginatedData = paginateData(filteredInfos, req.query.page);
    const totalAmount = calculateTotalAmount(filteredInfos);

    res.render("salesReport", {
      data: paginatedData.data,
      totalPages: paginatedData.totalPages,
      currentPage: paginatedData.currentPage,
      totalAmount: totalAmount,
      salesMonthly: true,
      date: customDate ? day : null, 
    });
  } catch (error) {
    // console.error("Error in sales report page:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

const monthlySalesReport = async (req, res) => {
  try {
    const targetMonth = parseInt(req.query.monthly);
    // const customDate = day ? new Date(day) : null;

    const targetDate = new Date("2024-03-31T18:30:00.000Z"); // Example timestamp

    const startOfMonth = new Date(targetDate.getFullYear(), targetMonth - 1, 1); // First day of the target month
    const endOfMonth = new Date(targetDate.getFullYear(), targetMonth, 0); // Last day of the target month

    let ordersWithCustomerInfo;
    if (targetMonth) {
      ordersWithCustomerInfo = await fetchOrdersForMonth(
        startOfMonth,
        endOfMonth
      );
    } else {
      ordersWithCustomerInfo = await fetchOrdersWithoutDay();
    }
    for (const order of ordersWithCustomerInfo) {
      if (order.coupon) {
        const couponValue = order.coupon;
        const couponDocument = await couponModel.findOne({
          _id: couponValue,
        });
        if (couponDocument) {
          const couponDiscount = couponDocument.discount;
          order.couponDiscount = couponDiscount;
        } else {
          order.couponDiscount = "no coupon";
        }
      }
    }
                     
    const filteredInfos = filterOrders(ordersWithCustomerInfo);
    const paginatedData = paginateData(filteredInfos, req.query.page);
    const totalAmount = calculateTotalAmount(filteredInfos);
                                                  
    res.render("salesReport", {       
      data: paginatedData.data,
      totalPages: paginatedData.totalPages,
      currentPage: paginatedData.currentPage,
      totalAmount: totalAmount,
      salesMonthly: true,
    });
  } catch (error) {
    //console.error("Error in sales report page:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

async function fetchOrdersForMonth(startOfMonth, endOfMonth) {
  return await orderModel.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    { $sort: { orderedOn: -1 } },
    { $match: { orderedOn: { $gt: startOfMonth, $lt: endOfMonth } } },
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
}

async function fetchOrdersForDay(customDate) {
  return await orderModel.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    { $sort: { orderedOn: -1 } },
    {
      $match: {
        orderedOn: {
          $gte: customDate,
          $lt: new Date(customDate.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    },
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
}

async function fetchOrdersWithoutDay() {
  return await orderModel.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
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
    { $unwind: "$product" },
  ]);
}

function filterOrders(orders) {
  return orders.filter((order) => order.products.status === "delivered");
}

function paginateData(data, page) {
  const itemsPerPage = 10;
  const currentPage = parseInt(page) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const totalPages = Math.ceil(data.length / itemsPerPage);
  return {
    data: data.slice(startIndex, endIndex),
    totalPages: totalPages,
    currentPage: currentPage,
  };
}

function calculateTotalAmount(filteredInfos) {
  return filteredInfos.reduce(
    (total, order) => total + order.products.productPrice,
    0
  );
}

// const fetchOrdersBetweenDates = async (req, res) => {
//   try {
//     const customStartDate = new Date(startingDate);
//     const customEndDate = new Date(endingDate);

//     const ordersWithCustomerInfo = await orderModel.aggregate([
//       {
//         $lookup: {
//           from: "users",
//           localField: "user",
//           foreignField: "_id",
//           as: "user",
//         },
//       },
//       { $unwind: "$user" },
//       { $sort: { orderedOn: -1 } },
//       { $match: { orderedOn: { $gte: customStartDate, $lt: customEndDate } } },
//       { $unwind: "$products" },
//       {
//         $lookup: {
//           from: "products",
//           localField: "products.product",
//           foreignField: "_id",
//           as: "product",
//         },
//       },
//       { $unwind: "$product" },
//     ]);

//     return ordersWithCustomerInfo;
//   } catch (error) {
//     console.error("Error fetching orders:", error.message);
//     throw error;
//   }
// };


const salesreportaccordingtotwodates = async(req,res)=>{
  try {
    const customStartDate = new Date(req.query.startdate);
const customEndDate = new Date(req.query.enddate);
console.log(customEndDate)
console.log(customStartDate)

const ordersWithCustomerInfo = await orderModel.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "user",
      foreignField: "_id",
      as: "user",
    },
  },
  { $unwind: "$user" },
  { $sort: { orderedOn: -1 } },
  {
    $match: {
      orderedOn: {
        $gte: customStartDate, // Greater than or equal to customStartDate
        $lt: customEndDate     // Less than customEndDate
      }
    }
  },
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
    // console.log("ordersWithCustomerInfo",ordersWithCustomerInfo)


    for (const order of ordersWithCustomerInfo) {
      if (order.coupon) {
        const couponValue = order.coupon;
        const couponDocument = await couponModel.findOne({
          _id: couponValue,
        });
        if (couponDocument) {
          const couponDiscount = couponDocument.discount;
          order.couponDiscount = couponDiscount;
        } else {
          order.couponDiscount = "no coupon";
        }
      }
    }
                     
    const filteredInfos = filterOrders(ordersWithCustomerInfo);
    const paginatedData = paginateData(filteredInfos, req.query.page);
    const totalAmount = calculateTotalAmount(filteredInfos);
    console.log("paginatedData",paginatedData)
                                                  
    res.render("salesReport", {       
      data: paginatedData.data,
      totalPages: paginatedData.totalPages,
      currentPage: paginatedData.currentPage,
      totalAmount: totalAmount,
      salesMonthly: true,
    });

    
  } catch (error) {
    // console.log(error.message)
    res.status(500).send('Internal Server Error');
  }
}

const salesReportController = {
  salesReportPage,
  monthlySalesReport,
  salesreportaccordingtotwodates
};

module.exports = salesReportController;
