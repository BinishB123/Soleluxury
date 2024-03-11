const couponModel = require("../model/couponModel");
const ObjectId = require("mongoose").Types.ObjectId
const cartModel = require("../model/cartModel")
//admin coupon
const couponPage = async (req, res) => {
  try {
    const errorMessage = req.flash("error");

    const coupons = await couponModel.find().sort({ createdOn: -1 });

    res.render("coupon", { errorMessage: errorMessage, coupons: coupons });
  } catch (error) {
    console.log(error.message);
  }
};

const addCoupon = async (req, res) => {
  try {
    let couponName = req.body.couponName;
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    const Discount = req.body.Discount;
    couponName = couponName.trim();
    const sameName = await couponModel.find({ name: couponName });
    if (sameName) {
      req.flash("error", "coupon exist with same name");
      res.redirect("/admin/coupon");
    } else {
      const couponAdd = {
        name: couponName,
        createdOn: startDate,
        expireOn: endDate,
        discount: Discount,
      };
      await couponModel.create(couponAdd);
    }
  } catch (error) {
    console.log(error.message);
  }
};

const editCouponPage = async (req, res) => {
  try {
    const id = req.query.id;
    const coupon = await couponModel.findOne({ _id: id });
    const createdOn = formatDate(coupon.createdOn);
    const expireOn = formatDate(coupon.expireOn);
    const errorMessage = req.flash("error");

    res.render("couponedit", {
      coupon: coupon,
      createdOn: createdOn,
      expireOn: expireOn,
      errorMessage: errorMessage,
    });
  } catch (error) {
    console.log(error.message);
  }
};

function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  let month = (date.getMonth() + 1).toString().padStart(2, "0");
  let day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const updatecoupon = async (req, res) => {
  try {
    let couponName = req.body.couponName.trim();
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    const Discount = req.body.Discount;

    const sameName = await couponModel.findOne({
      name: couponName,
      _id: { $ne: req.query.id },
    });

    if (sameName) {
      req.flash("error", "Coupon exists with the same name");
      return res.redirect(`/admin/editcoupon?id=${req.query.id}`);
    }

    await couponModel.findByIdAndUpdate(req.query.id, {
      name: couponName,
      createdOn: startDate,
      expireOn: endDate,
      discount: Discount,
    });

    res.redirect("/admin/coupon");
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};

///USER COUPON MANAGEMENT
const couponUse = async (req, res) => {
  try {
    const couponId = req.query.id;
    const userid = req.session.user._id
    const subtotal = parseInt(req.body.subtotal);
    const coupon = await couponModel.findOne({ _id: couponId });
    const cart = await cartModel.findOne({userId:userid})
     cart.totalPrice  = Math.round(
      cart.totalPrice - (cart.totalPrice * coupon.discount) / 100); 
     const couponApplied =  await cart.save()
     if (couponApplied) {
      res.json({success:true ,newPrice:cart.totalPrice})
     }else{
      res.json({success:false})
     }





    
  } catch (error) {
    console.log(error.message);
  }
};


const couponController = {
  couponPage,
  addCoupon,
  editCouponPage,
  updatecoupon,
  couponUse,
};

module.exports = couponController;
