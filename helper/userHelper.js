const order = require("../model/orderModel");
const user = require("../model/userModel");
const userModel = require("../model/userModel");
const walletModel = require("../model/walletModel");
const productModel = require("../model/productModel");
const cartModel = require("../model/cartModel");
const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");
const Razorpay = require("razorpay");
const { name } = require("ejs");
var instance = new Razorpay({
  key_id: process.env.key_id,
  key_secret: process.env.key_secret,
});

const loginHome = (userData) => {
  // console.log(userData)
  return new Promise(async (resolve, reject) => {
    try {
      let user = await userModel.findOne({ email: userData.email });
      let response = {};

      if (user) {
        //console.log('The user is now at loginhome and and finded the user')
        // console.log(user.isActive)
        if (user.isActive) {
          bcrypt.compare(userData.password, user.password).then((result) => {
            if (result) {
              // console.log(result)
              response.user = user;
              response.login = true;
              //  console.log(response)
              resolve(response);
            } else {
              response.loginMessage = "invalid email or password";
              resolve(response);
            }
          });
        } else {
          response.loginMessage = "Your are Blocked";
          resolve(response);
        }
      } else {
        response.loginMessage = "invalid username or password";
        resolve(response);
      }
    } catch (error) {
      console.log(error);
    }
  });
};

const doSignUp = (userData, verify, emailVerify) => {
  return new Promise(async (resolve, reject) => {
    try {
      let u = false;
      const userExist = await userModel.findOne({
        $or: [{ email: userData.email }],
      });

      const response = {};
      console.log(userData.referralcode);

      if (userData.referralcode) {
        const userWithReferralcode = await userModel.findOne({
          referalCode: userData.referralcode,
        });
        console.log(userWithReferralcode);

        if (userWithReferralcode) {
          const userHaveWallet = await walletModel.findOne({
            userid: userWithReferralcode._id,
          });
          // console.log("no mach",userHaveWallet)
          if (userHaveWallet) {
            // Assuming checker object and userid are defined somewhere
            const updating = await walletModel.updateOne(
              { userid: userWithReferralcode._id },
              {
                $push: {
                  walletDatas: {
                    amount: 100,
                    date: new Date(),
                    paymentMethod: "referral Offer",
                  },
                },
                $inc: { balance: 100 },
              }
            );
            // console(updating)
            u = true;
            // console.log(u)
            // console.log("updating in if ", updating);
          } else {
            const creating = await walletModel.create({
              userid: userWithReferralcode._id,
              balance: 100,
              walletDatas: [
                {
                  amount: 100,
                  date: new Date(),
                  paymentMethod: "referral Offer",
                },
              ],
            });
            u = true;
            console.log("creating in else", creating);
          }
        }
      }

      if (emailVerify === userData.email) {
        if (!userExist) {
          // console.log("user not exist");

          if (userData.password === userData.confirmPassword) {
            // console.log("password matched");
            // console.log(verify);

            if (verify) {
              // console.log("verified");

              const password = await bcrypt.hash(userData.password, 10);
              const referalCode = await generateRandomString();

              const newUser = {
                name: userData.name,
                email: userData.email,
                mobile: userData.mobile,
                password: password,
                referalCode: referalCode,
              };

              const createdUser = await userModel.create(newUser);

              console.log("User created:", createdUser);
              console.log(u);
              response.user = createdUser;
              response.u = u;
              response.status = true;
              response.message = "Signed Up Successfully";
              console.log(response);
              resolve(response);
            } else {
              response.status = false;
              response.message = "OTP Does not match";
              resolve(response);
            }
          } else {
            response.status = false;
            response.message = "Password does not match";
            resolve(response);
          }
        } else {
          response.status = false;
          response.message = "User already exists";
          resolve(response);
        }
      } else {
        response.status = false;
        response.message = "Email not matched";
        resolve(response);
      }
    } catch (error) {
      console.error("Error during sign up:", error.message);
      reject(error);
    }
  });
};

const checkingUserBlockedOrNot = async (req, res, next) => {
  try {
    if (req.session.user) {
      next();
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const checkUserBlockOrNo = async (req, res, next) => {
  try {
    if (req.session.user) {
      next();
    } else {
      res.json({ stay: false, url: "/login" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const generateRazorpay = (userId, totalAmount) => {
  return new Promise(async (resolve, reject) => {
    try {
      // console.log("orderid at generate razorpay",orderId)
      // console.log("totalAmount ",totalAmount)
      instance.orders.create(
        {
          amount: Math.round(totalAmount * 100),
          currency: "INR",
          receipt: userId,
          notes: {
            key1: "value3",
            key2: "value2",
          },
        },
        function (err, order) {
          if (err) {
            console.error(err);
            return;
          } else {
            const response = {
              success: true,
              order: order,
            };
            //  console.log("order in generateRazorpay",order)
            resolve(response);
          }
        }
      );
    } catch (error) {
      console.log(error.message);
    }
  });
};

function generateRandomString() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 15; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
}

const productQuantityChecker = async (req, res, next) => {
  try {
    const user = req.session.user._id;
    const userCart = await cartModel.aggregate([
      { $match: { userId: new ObjectId(user) } },
      { $unwind: "$items" },
    ]);
    //  console.log("usercart",userCart)
    let f = false;
    for (let cart of userCart) {
      let [product] = await productModel.aggregate([
        { $match: { _id: new ObjectId(cart.items.productId) } },
        {
          $project: {
            size: `$size.${cart.items.size}.quantity`,
            name: "$productName",
          },
        },
      ]);
      if (product.size < cart.items.quantity) {
        // console.log("kk");
        return res.json({
          success: false,
          mess: `${product.name} Quantity Exceeds ! `,
        });
      } else {
        f = true;
      }
    }

    if (f === true) {
      return next();
    }
  } catch (error) {
    console.log(error.message);
  }
};

const addresChecker = async (req, res, next) => {
  try {
    console.log(req.body.addressId);
    const address = req.body.addressId;
    if (address) {
      next();
    } else {
      return res.json({ success: false, mess: `Add Address` });
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  doSignUp,
  loginHome,
  checkingUserBlockedOrNot,
  generateRazorpay,
  productQuantityChecker,
  checkUserBlockOrNo,
  addresChecker,
};
