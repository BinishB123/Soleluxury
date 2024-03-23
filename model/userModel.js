const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  isVerfied: {
    type: Boolean,
    default: true,
  },
  mobile: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  address: [
    {
      name: { type: String },
      mobile: { type: Number },
      housName: { type: String },
      pincode: { type: Number },
      CityOrTown: { type: String },
      district: { type: String },
      state: { type: String },
      country: { type: String },
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
  referalCode:{
    type:String,
    required:true
  }
});
const user = mongoose.model("user", userSchema);
module.exports = user;
