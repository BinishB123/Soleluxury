const mongoose = require("mongoose");

const walletSchema = mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
  walletDatas: [{
    amount: {
      type: Number,
    },
    date: {
      type: Date,
    },
    paymentMethod: {
      type: String,
    }
  }]
});

const Wallet = mongoose.model("wallets", walletSchema); // Changed from mongoose.Model to mongoose.model
module.exports = Wallet;
