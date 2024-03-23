const walletModel = require("../model/walletModel")
const userHelper = require("../helper/userHelper")
const order = require("../model/orderModel")
const crypto = require("crypto")


const wallet = async(req,res)=>{
    try {
        const userid = req.session.user._id
        const walletdata = await walletModel.find({userid:userid})
        console.log("wallet",walletdata)
        
    } catch (error) {
       console.log(error.message) 
    }
}


const addMoneyWallet = async(req,res)=>{
    try {
        const userId = req.session.user._id
        const amount =JSON.parse(req.body.amount)
        const razorpay = await userHelper.generateRazorpay(userId,amount)
        console.log("razorpay",razorpay)
        if (razorpay.success === true) {
            res.json({ status: true, order: razorpay.order });
          } else {
            res.json({ status: false });
          }

        
    } catch (error) {
      console.log(error.message)  
    }
}

const verifyPayment = async (req, res) => {
    try {
      const payment = req.body.payment;
      const amount = JSON.parse(req.body.amount)
      console.log("payment",payment)
      const orderId = req.body.order.id;
      console.log("order",req.body.order)
      
  
      const user = req.session.user._id;
  
      const secret = "p82tQtMSPH6JUUjE7vwvh4HQ";
      const generatedSignature = crypto
        .createHmac("sha256", secret)
        .update(orderId + "|" + payment.razorpay_payment_id)
        .digest("hex");
  
      if (generatedSignature === payment.razorpay_signature) {
        const userHaveWallet = await walletModel.findOne({ userid: user });
        if (userHaveWallet) {
          const updating = await walletModel.updateOne(
            { userid: user },
            {
              $push: {
                walletDatas: {
                  amount: amount,
                  date: new Date(), // Set the current date
                  paymentMethod: "razorpay", // Set the payment method
                },
              },
              $inc: { balance: amount },
            }
          );
          console.log("updatinf in if ", updating);
        } else {
          const creating = await walletModel.create({
            userid: user,
            balance: amount,
            walletDatas: [
              {
                amount: amount,
                date: new Date(),
                paymentMethod: "razorpay",
              },
            ],
          });
          console.log("creating in else", creating);
        }
      
        
      } else {
        // console.log("Payment verification failed");
        res
          .status(400)
          .json({ success: false, message: "Payment verification failed" });
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  };
  


const walletContoller = {
    wallet,
    addMoneyWallet,
    verifyPayment
}

module.exports= walletContoller