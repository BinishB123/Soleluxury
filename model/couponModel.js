const mongoose = require("mongoose");
const couponSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  couponCode: {
    type: String,
    uppercase: true,
    unique: true,
    default: generateCouponCode,
  },
  createdOn: {
    type: Date,
    required: true,
  },
  expireOn: {
    type: Date,
    required: true,
  },
  isList: {
    type: Boolean,
    default: true,
  },

  discount: {
    type: Number,
    required: true,
  },

  usedByUser: [
    {
      type: mongoose.Schema.Types.ObjectId,
    },
  ],
});

function generateCouponCode() {
  const length = 8;
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let couponCode = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    couponCode += characters.charAt(randomIndex);
  }
  return couponCode;
}

couponSchema.pre("save", function (next) {
  if (this.expireOn <= new Date()) {
    this.isListed = false;
  } else {
    this.isListed = true;
  }
  next();
});

const coupon = mongoose.model("coupons", couponSchema);
module.exports = coupon;
