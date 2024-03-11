const orderModel = require("../model/orderModel");
const couponModel = require("../model/couponModel")

const salesReportPage = async (req, res) => {
  try {
    const day = req.query.day; // Assuming day is in the format "YYYY-MM-DD"
    const customDate = new Date(day)
console.log("custom date", customDate)
    if(day!=undefined){
     

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
  { $sort: { orderedOn: -1 } }, // Default sorting by orderedOn
  { 
    $match: { 
      orderedOn: { 
        $gte: customDate, // Filter orders with orderedOn >= customDate
        $lt: new Date(customDate.getTime() + 24 * 60 * 60 * 1000) // Until the end of the day
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
for (const order of ordersWithCustomerInfo) {
  
  if (order.coupon) {
   
    const couponValue = order.coupon;
    const couponDocument = await couponModel.findOne({
      _id:couponValue,
    });

    if (couponDocument) {
      const couponDiscount = couponDocument.discount;
      order.couponDiscount = couponDiscount;
      
    } else {
      order.couponDiscount = "no coupon";
    }
  }
}


      const filteredInfos = ordersWithCustomerInfo.filter((order)=>{
          return order.products.status==="delivered"
      })
      console.log(filteredInfos)
      let itemsPerPage = 10;
      let currentPage = parseInt(req.query.page) || 1;
      let startIndex = (currentPage - 1) * itemsPerPage;
      let endIndex = startIndex + itemsPerPage;
      let totalPages = Math.ceil(filteredInfos.length / itemsPerPage);
      const currentdata = filteredInfos.slice(startIndex, endIndex);
      let totalAmount = 0;
      for (let i = 0; i < filteredInfos.length; i++) {
        totalAmount += filteredInfos[i].products. productPrice;
      }
      //console.log("ppppppppppppppp",ordersWithCustomerInfo,")))))))))))))))))))")
  
      res.render("salesReport", {
        data: currentdata,
        totalPages: totalPages,
        currentPage: currentPage,
        totalAmount: totalAmount,
        salesMonthly:true,
        date:day
      });

    }else{
    const ordersWithCustomerInfo = await orderModel.aggregate([
      {
        $lookup: {
          from: "users", 
          localField: "user", // Replace with the field from the input documents
          foreignField: "_id", // Replace with the field from the documents of the "from" collection
          as: "user", // Replace with the output array field
        },
      },
      { $unwind: "$user" },
      { $sort: { orderedOn: -1 } },
      {$unwind:"$products"},
     {
       $lookup: {
         from: "products", 
         localField: "products.product", // Replace with the field from the input documents
         foreignField: "_id", // Replace with the field from the documents of the "from" collection
         as: "product", // Replace with the output array field
       },
     },
      {$unwind:"$product"},
      
    ]);
    for (const order of ordersWithCustomerInfo) {
  
      if (order.coupon) {
       
        const couponValue = order.coupon;
        const couponDocument = await couponModel.findOne({
          _id:couponValue,
        });
    
        if (couponDocument) {
          const couponDiscount = couponDocument.discount;
          order.couponDiscount = couponDiscount;
          
        } else {
          order.couponDiscount = "no coupon";
        }
      }
    }
    
    
    const filteredInfos = ordersWithCustomerInfo.filter((order)=>{
        return order.products.status==="delivered"
    })
    console.log(filteredInfos)
    let itemsPerPage = 10;
    let currentPage = parseInt(req.query.page) || 1;
    let startIndex = (currentPage - 1) * itemsPerPage;
    let endIndex = startIndex + itemsPerPage;
    let totalPages = Math.ceil(filteredInfos.length / itemsPerPage);
    const currentdata = filteredInfos.slice(startIndex, endIndex);
    let totalAmount = 0;
    // for (let i = 0; i < filteredInfos.length; i++) {
    //   totalAmount += filteredInfos[i].products. productPrice;
    // }

    res.render("salesReport", {
      data: currentdata,
      totalPages: totalPages,
      currentPage: currentPage,
      salesMonthly:true
    });
  }
  } catch (error) {
    console.log(error.message);
  }
};





// const salesWeekly= async(req,res)=>{
//   try{

//     const day = 0
//     let currentDate = new Date();
//     const startOfTheWeek = new Date(
//       currentDate.getFullYear(),
//       currentDate.getMonth(),
//       currentDate.getDate() - currentDate.getDay()
//     );

//     const endOfTheWeek = new Date(
//       currentDate.getFullYear(),
//       currentDate.getMonth(),
//       currentDate.getDate() + (6 - currentDate.getDay()),
//       23,
//       59,
//       59,
//       999

//     )




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
//       { $sort: { orderedOn: -1 } }, // Default sorting by orderedOn
//       { 
//         $match: { 
//           orderedOn: { 
//             $gte: startOfTheWeek, // Filter orders with orderedOn >= customDate
//             $lt: endOfTheWeek // Until the end of the day
//           } 
//         } 
//       },
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
//     for (const order of ordersWithCustomerInfo) {
      
//       if (order.coupon) {
       
//         const couponValue = order.coupon;
//         const couponDocument = await couponModel.findOne({
//           _id:couponValue,
//         });
    
//         if (couponDocument) {
//           const couponDiscount = couponDocument.discount;
//           order.couponDiscount = couponDiscount;
          
//         } else {
//           order.couponDiscount = "no coupon";
//         }
//       }
//     }
    
    
//           const filteredInfos = ordersWithCustomerInfo.filter((order)=>{
//               return order.products.status==="delivered"
//           })
//           console.log(filteredInfos)
//           let itemsPerPage = 10;
//           let currentPage = parseInt(req.query.page) || 1;
//           let startIndex = (currentPage - 1) * itemsPerPage;
//           let endIndex = startIndex + itemsPerPage;
//           let totalPages = Math.ceil(filteredInfos.length / itemsPerPage);
//           const currentdata = filteredInfos.slice(startIndex, endIndex);
//           let totalAmount = 0;
//           for (let i = 0; i < filteredInfos.length; i++) {
//             totalAmount += filteredInfos[i].products. productPrice;
//           }
//           //console.log("ppppppppppppppp",ordersWithCustomerInfo,")))))))))))))))))))")
      
//           res.render("salesReport", {
//             data: currentdata,
//             totalPages: totalPages,
//             currentPage: currentPage,
//             totalAmount: totalAmount,
//             salesMonthly:true,
//             date:day
//           });
    

//   }catch(err){
//     console.log(err.message)
//   }
// }
const salesReportController = {
  salesReportPage,
};

module.exports = salesReportController;
