const userModel = require("../model/userModel");
const userHelper = require("../helper/userHelper");
//const nodemailer = require("nodemailer");
const { response } = require("express");
const productModel = require("../model/productModel")
const productHelper = require("../helper/productHelper")
const cartModel = require("../model/cartModel");
const user = require("../model/userModel");
const walletModel = require("../model/walletModel")
const orderModel = require("../model/orderModel")
const offerHelper = require("../helper/offerHelper")
const bcrypt= require("bcryptjs")
const cartHelper = require("../helper/cartHelper");
const product = require("../model/productModel");
const { parse } = require("dotenv");
const {ObjectId} = require('mongodb')
//loginuser start//



const forgotPassword = async(req,res,next)=>{
  try {
    
         if (req.session.user) {
          res.redirect("/home")
         }else{
          const message = req.flash("message")
          res.render("forgotpassword",{message:message})
         }
    
  } catch (error) {
    console.error("Error in  forgotpassword:", error);
   
    next(error)

  }
}

const updatingPassword = async (req, res,next) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      req.flash("message", "Missing required fields");
      return res.redirect("/forgotPassword");
    }

    const finalNewpass = password.trim();
    const finalCnfmpass = confirmPassword.trim();

    if (finalCnfmpass !== finalNewpass) {
      req.flash("message", "Passwords do not match");
      return res.redirect("/forgotPassword");
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      req.flash("message", "No user found with this email");
      return res.redirect("/forgotPassword");
    }

    const newPassword = await bcrypt.hash(finalCnfmpass, 10);
    const updated = await userModel.updateOne({ email }, { $set: { password: newPassword } });

    if (updated.modifiedCount === 1) {
      req.flash("message", "Password changed successfully");
      return res.redirect("/login");
    } else {
      req.flash("message", "Failed to update password. Please try again.");
      return res.redirect("/forgotPassword");
    }
  } catch (error) {
    console.error("Error in  updatepassword:", error);
   
    next(error)
  }
};






const loginload = function (req, res,next) { 
  try{ 
  if (req.session.user) {
    res.redirect("/home");
  } else {
    const message = req.flash("message")
    res.render("login",{message:message});
  }
}catch(error){
  console.error("Error in  loginload:", error);
   
  next(error)
}
};

const loadSignUp = function (req, res,next) {
  try{
  if (req.session.user) {
    res.redirect("/home");    
  } else {
   const message=req.flash("message");
    res.render("signup",{message:message});
  }
}catch(error){
  console.error("Error in  loadsignup:", error);
   
  next(error)
}
};


const insertUser = async (req, res,next) => {
  try {
    // console.log("Request Entered to insertUser");
    // console.log(req.body.confirmPassword);
    const response = await userHelper.doSignUp(
      req.body,
      req.session.otpmatched,
      req.session.userEmail
    );

    if (!response.status) {
      const message = response.message;
      req.flash("message", message);
      return res.redirect("/signup");
    } else {
      if (response.u) {
        // Assuming userHaveWallet variable is defined somewhere
        const userHaveWallet = await walletModel.findOne({ userid: response.user._id });

        if (userHaveWallet) {
          const updating = await walletModel.updateOne(
            { userid: response.user._id },
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
          req.flash("message", response.message);
          res.redirect("/login");
        } else {
          const creating = await walletModel.create({
            userid: response.user._id,
            balance: 100,
            walletDatas: [
              {
                amount: 100,
                date: new Date(),
                paymentMethod: "referral Offer",
              },
            ],
          });
          // console.log("creating in else", creating);
        }
      }
    }

    req.flash("message", response.message);
    res.redirect("/login");
  } catch (error) {
    console.error("Error in  insertuser:", error.message);
   
    next(error)
  }
};



const loginHome = async (req, res,next) => {
  try {
    const response = await userHelper.loginHome(req.body);
    
    if (response.login) {
      req.session.user = response.user;
     
      res.redirect("/home");
    } else {
      
      res.render("login", { errorMessage: response.loginMessage });
    }
  } catch (error) {
    console.error("Error in  loginhome:", error);
   
    next(error)
  }
};


const userHome = async(req,res,next)=>{
  try{
  
  if (req.session.user) {
    const product= await productModel.find()
    const productNotBlocked = await productHelper.productFiltered()
    const products = await offerHelper.findOffer(productNotBlocked)
    res.render("home",{data:products,user:req.session.user})
  }else{
    res.redirect('/')
  }
}catch(error){
  console.error("Error in  userhome:", error);
   
  next(error)
}
}

const logout = (req,res,next)=>{
  try{
      req.session.user = null
      res.redirect('/')

  }catch(error){
    console.error("Error in  logout:", error);
   
    next(error)
  }
}


const productView = async (req, res,next) => {
  try {
      const id = req.params.id
  // console.log(id)
      const product = await productModel.findOne({ _id: id })
      
      const item = await offerHelper.productViewOffer(product)
      if (req.session.user) {
          const userId = req.session.user._id
          const productAlreadyInTheCart = await cartModel.findOne({
              userId: userId,
              items: {
                  $elemMatch: { productId: id }
              }
          });
  
          res.render("productview", {
              data: product,
              user: userId,
              productAlreadyInCart: productAlreadyInTheCart,
              discountPrice: item.salePrice // Pass the discounted price to the view
          });
      } else {
          res.render("productview", {
              data: product,
              user: req.session.user,
              discountPrice: item.salePrice // Pass the discounted price to the view
          });
      }

  } catch (error) {
    console.error("Error in  productview:", error.message);
   
    next(error)

  }
}



const displaySize =async(req,res,next)=>{
  try {

      
        
        const id = req.params.id;
       
        const size = req.params.size
       
       
         const product = await productModel.findOne({_id:id})
         
         const small = product.size.s.quantity 
         const medium = product.size.m.quantity 
         const large =product.size.l.quantity
         
         if (size==='s') {
          res.json({message:small})
         }else if (size ==='m') {
          res.json({message:medium})
          
         }else if (size==='l') {
            res.json({message:large})
         }
        
      
    
  } catch (error) {
    console.error("Error in  displaysize:", error);
   
    next(error)

    
  }
}

const guestUser = async(req,res,next)=>{
  try{
  if (!req.session.user) {
    const product= await productModel.find()
    const productNotBlocked = await productHelper.productFiltered()
    const products = await offerHelper.findOffer(productNotBlocked)
    res.render("home",{data:products})
  }else{
    res.redirect("/home")
  }
}catch(error){
  console.error("Error in  guestuser:", error);
   
  next(error)
}
  
}


const viewCart = async (req, res, next) => {
  try {
    if (req.session.user) {
      const id = req.session.user._id;
      const userCart = await cartModel.findOne({ userId: id });
      let products = [];

      if (userCart) {
        for (let i = 0; i < userCart.items.length; i++) {
          const product = await productModel.findById(userCart.items[i].productId);
          if (product) {
            const size = userCart.items[i].size;
            const quantity = userCart.items[i].quantity;
            const finalProduct = Object.assign({}, product.toObject(), {
              size: size,
            }, {
              quantity: quantity
            });
            products.push(finalProduct);
          }
        }

        for (let i = 0; i < products.length; i++) {
          products[i].salePrice = Math.round(
            products[i].regularPrice -
            (products[i].regularPrice * products[i].discount) / 100
          );
        }
      //  console.log(products);
        const totalPrice = await cartHelper.subtotal(products, id);
        res.render("cart", { products: products, totalPrice: totalPrice, user: id });
      } else {
        res.render("cart", { user: id });
      }
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    console.error("Error in viewcart:", error.message);
    next(error);
  }
};




const profile = async(req,res,next)=>{
  try{
  if (req.session.user) {
    const id = req.session.user._id
    const user = await userModel.findOne({_id:id})
    const orderdetail = await orderModel.find({user:id}).sort({orderedOn:-1})
    const walletdata = await walletModel.findOne({ userid: id }).lean(); // Fetch the document
    if (walletdata) {
        walletdata.walletDatas.sort((a, b) => b.date - a.date); // Sort the walletDatas array
    }
       
    
    const message = req.flash("message")
    const errormessage = req.flash("errormessage")
    res.render("profile",{user:user,orderdetail:orderdetail,message:message,errormessage:errormessage,wallet:walletdata}) 
  }else{
    res.redirect("/login")
  }
}catch(error){
  console.error("Error in  profile:", error);
   
  next(error)
}
  
}


const editUserProfile = async(req,res,next)=>{
  try {
    if (req.session.user) {
      const userId = req.session.user._id
      const user =  await userModel.findOne({_id:userId})
      const passwordCheck = await bcrypt.compare(req.body.password,user.password)
      if (passwordCheck) {
        user.name =req.body.name,
        user.mobile = req.body.mobile,
        await user.save();
        // console.log("verified")
        res.redirect("/profile")
        
      }else{
        // console.log("not verified")
        res.redirect("/profile")
      }

    }else{
      res.redirect("/login")
    }
    
  } catch (error) {
    console.error("Error in  edituserprofile:", error);
   
    next(error)

  }
}



const search = async (req, res,next) => {
  try {
      const searchTerm = req.query.search;
      let productData = req.body.allPrdoucts;

      if (productData) {
          // If product data is available in the request body, use it directly
          const products =  await offerHelper.findOffer(productData)

          const itemsPerPage = 6;
          const currentPage = parseInt(req.query.page) || 1;
          const startIndex = (currentPage - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          const totalPages = Math.ceil(products.length / itemsPerPage);
          const currentProduct = products.slice(startIndex, endIndex);
          const baseRoute = "/search";
          const sortPage = false;
          
          return res.render("searchedProducts", {
              product: currentProduct,
              totalPages: totalPages,
              currentPage: currentPage,
              baseRoute: baseRoute,
              additionalQueryParameter: undefined,
              allPrdoucts: products,
              sortPage: sortPage
          });
      }

      // If product data is not available, perform a database query
      const searchedThings = await productModel.aggregate([
        {
            $match: {
                $or: [
                    { productName: { $regex: new RegExp(searchTerm, "i") } }, // Match substring in productName
                    { brand: { $regex: new RegExp(searchTerm, "i") } } // Match substring in brand
                ]
            }
        },
        {
            $lookup: {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "category"
            }
        },
        { $unwind: "$category" }
    ]);
    
    

      const product = await offerHelper.findOffer(searchedThings);

      const itemsPerPage = 6;
      const currentPage = parseInt(req.query.page) || 1;
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const totalPages = Math.ceil(product.length / itemsPerPage);
      const currentProduct = product.slice(startIndex, endIndex);
      const baseRoute = "/search";
      const sortPage = false;

      res.render("searchedProducts", {
          product: currentProduct,
          totalPages: totalPages,
          currentPage: currentPage,
          baseRoute: baseRoute,
          additionalQueryParameter: undefined,
          allPrdoucts: product,
          sortPage: sortPage
      });
  } catch (error) {
    console.error("Error in  search:", error);
   
    next(error)
  }
};



const nav = async(req,res,next)=>{
  try {
    let productData = req.body.allPrdoucts;

      if (productData) {
          // If product data is available in the request body, use it directly
          const products =  await offerHelper.findOffer(productData)

          const itemsPerPage = 6;
          const currentPage = parseInt(req.query.page) || 1;
          const startIndex = (currentPage - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          const totalPages = Math.ceil(products.length / itemsPerPage);
          const currentProduct = products.slice(startIndex, endIndex);
          const baseRoute = "/nav";
          const sortPage = false;
          
          return res.render("searchedProducts", {
              product: currentProduct,
              totalPages: totalPages,
              currentPage: currentPage,
              baseRoute: baseRoute,
              additionalQueryParameter: undefined,
              allPrdoucts: productData,
              sortPage: sortPage
          });
      }
    
    const product =  await productModel.aggregate([
      {
          $lookup: {
              from:"categories",
               localField:"category",
            foreignField:"_id",
            as:"category"
          }
      },
      {
          $match: {
              "category.islisted": true,
              "isBlocked": false
          }
      },{
          $unwind:"$category"
      }
      
  ]);
const products = await offerHelper.findOffer(product)
    // console.log("nav",products)
    let itemsPerPage = 6
    let currentPage = parseInt(req.query.page) || 1
    let startIndex = (currentPage-1)* itemsPerPage
    let endIndex = startIndex +itemsPerPage
    let totalPages = Math.ceil(products.length/itemsPerPage)
    const currentProduct = products.slice(startIndex,endIndex)
    let additionalQueryParameter = undefined;
    const sortPage = false

  
    res.render("searchedProducts",{product:currentProduct,totalPages:totalPages,currentPage,baseRoute:"/nav",additionalQueryParameter,allPrdoucts:products,sortPage:sortPage})
    
    
  } catch (error) {
    console.error("Error in  nav:", error);
   
    next(error)

  }
}


const filteredBrand = async(req,res,next)=>{
  try {
   
    const clicked = req.query.brand
    const latest = req.query.latest
    let productData = req.body.allPrdoucts;
    if (productData) {
      // If product data is available in the request body, use it directly
      const products =  await offerHelper.findOffer(productData)

      const itemsPerPage = 6;
      const currentPage = parseInt(req.query.page) || 1;
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const totalPages = Math.ceil(products.length / itemsPerPage);
      const currentProduct = products.slice(startIndex, endIndex);
      const baseRoute = "/filtered";
      const sortPage = false;
      
      return res.render("searchedProducts", {
          product: currentProduct,
          totalPages: totalPages,
          currentPage: currentPage,
          baseRoute: baseRoute,
          additionalQueryParameter: undefined,
          allPrdoucts: productData,
          sortPage: sortPage
      });
  }

       if(latest==="latest"){
        const productsWithCategories = await productModel.aggregate([
          {$match:{isBlocked:false}},
          {
            $lookup: { 
              from: 'categories',
              localField: 'category',
              foreignField: '_id',
              as: 'category' 
            }
          },
          {
            $sort: { createdOn: -1 } // Sorting by the createdOn field in descending order
          },
          {$unwind:"$category"}
        ]);
         const products =  await offerHelper.findOffer(productsWithCategories)
         let itemsPerPage = 6
         let currentPage = parseInt(req.query.page) || 1

        
         let startIndex = (currentPage-1)* itemsPerPage
         let endIndex = startIndex +itemsPerPage
         let totalPages = Math.ceil(products.length/itemsPerPage)
         const currentProduct = products.slice(startIndex,endIndex)
         let additionalQueryParameter = latest ? "latest=latest" : "";
        res.render("searchedProducts",{product:currentProduct,totalPages:totalPages,currentPage,baseRoute:"/filtered",additionalQueryParameter,allPrdoucts:products})
        return
       }
      const product = await productModel.aggregate([
        {$match:{brand:clicked}},
        {
          $lookup: {
            from: "categories", // The collection to join with
            localField: "category", // Field from the input documents
            foreignField: "_id", // Field from the documents of the "categories" collection
            as: "category" // Output array field containing the joined documents
          }
        },
        {$unwind:"$category"}
      ])
      const products =  await offerHelper.findOffer(product)
      let itemsPerPage = 6
         let currentPage = parseInt(req.query.page) || 1
         let startIndex = (currentPage-1)* itemsPerPage
         let endIndex = startIndex +itemsPerPage
         let totalPages = Math.ceil(products.length/itemsPerPage)
         const currentProduct = products.slice(startIndex,endIndex)
        //  console.log("currentProduct",currentProduct.length)
         let additionalQueryParameter = clicked ? `brand=${clicked}` : undefined;
        res.render("searchedProducts",{product:currentProduct,totalPages:totalPages,currentPage,baseRoute:"/filtered",additionalQueryParameter,allPrdoucts:products})
        return
    
      
  } catch (error) {
    console.error("Error in  filteredbrand:", error);
   
    next(error)

  }
}

const pricefiltered = async (req, res,next) => {
  const clicked = req.query.clicked;
  let productData = req.body.allPrdoucts;
  const sortPage = true
  
  try {
      productData = JSON.parse(productData);
      
      productData = await offerHelper.findOffer(productData)
      
      if (clicked==='lth') {
        const product = productData.sort((a,b)=>{
           return a.salePrice - b.salePrice
        })

        let itemsPerPage = 6
        let currentPage = parseInt(req.query.page) || 1
        let startIndex = (currentPage-1)* itemsPerPage
        let endIndex = startIndex +itemsPerPage
        let totalPages = Math.ceil(product.length/itemsPerPage)
        const currentProduct = product.slice(startIndex,endIndex)
        // console.log("currentProduct",currentProduct.length)
        let additionalQueryParameter = clicked ? `clicked=${clicked}` : "";
        res.render("searchedProducts",{product:currentProduct,totalPages:totalPages,currentPage,baseRoute:"/pricefiltered",additionalQueryParameter,allPrdoucts:product,sortPage})
       return
        
      }else{
        const product = productData.sort((a,b)=>{
         return b.salePrice - a.salePrice})
         let itemsPerPage = 6
        let currentPage = parseInt(req.query.page) || 1
        let startIndex = (currentPage-1)* itemsPerPage
        let endIndex = startIndex +itemsPerPage
        let totalPages = Math.ceil(product.length/itemsPerPage)
        const currentProduct = product.slice(startIndex,endIndex)
        // console.log("currentProduct",currentProduct.length)
        let additionalQueryParameter = clicked ? `clicked=${clicked}` : "";
        res.render("searchedProducts",{product:currentProduct,totalPages:totalPages,currentPage,baseRoute:"/pricefiltered",additionalQueryParameter,allPrdoucts:product,sortPage})


      }
     
      
  } catch (error) {
    console.error("Error in  pricefiltered:", error);
   
    next(error)

  }
  
}


const categoryFilter = async(req,res,next)=>{
  try {
    const clicked = req.query.clicked
    const productWithcategory = JSON.parse(req.body.allPrdoucts)
    const sortPage = true
   
    if (clicked === "mens") {
      
      const matchedMenscat = productWithcategory.filter(product=>product.category.name=="Mens")
      // console.log("mens",matchedMenscat)
         const product= await offerHelper.findOffer(matchedMenscat)
         const itemsPerPage = 6
         let currentPage = parseInt(req.query.page) || 1
         let startIndex = (currentPage-1)* itemsPerPage
         let endIndex = startIndex +itemsPerPage
         let totalPages = Math.ceil(product.length/itemsPerPage)
         const currentProduct = product.slice(startIndex,endIndex)
        //  console.log("currentProduct",currentProduct.length)
         let additionalQueryParameter = clicked ? `clicked=${clicked}` : "";
         res.render("searchedProducts",{product:currentProduct,totalPages:totalPages,currentPage,baseRoute:"/categoryFilter",additionalQueryParameter,allPrdoucts:product,sortPage:sortPage})
 
    
     }else if(clicked === "kids"){
      const matchedMenscat = productWithcategory.filter(product=>product.category.name=="kids")
      const product= await offerHelper.findOffer(matchedMenscat)
      const itemsPerPage = 6
      let currentPage = parseInt(req.query.page) || 1
        let startIndex = (currentPage-1)* itemsPerPage
        let endIndex = startIndex +itemsPerPage
        let totalPages = Math.ceil(product.length/itemsPerPage)
        const currentProduct = product.slice(startIndex,endIndex)
        // console.log("currentProduct",currentProduct.length)
        let additionalQueryParameter = clicked ? `clicked=${clicked}` : "";
        res.render("searchedProducts",{product:currentProduct,totalPages:totalPages,currentPage,baseRoute:"/categoryFilter",additionalQueryParameter,allPrdoucts:product,sortPage:sortPage})


     }else if(clicked === "womens"){
      const matchedMenscat = productWithcategory.filter(product=>product.category.name=="Womens")
      const product= await offerHelper.findOffer(matchedMenscat)
      const itemsPerPage = 6
      let currentPage = parseInt(req.query.page) || 1
        let startIndex = (currentPage-1)* itemsPerPage
        let endIndex = startIndex +itemsPerPage
        let totalPages = Math.ceil(product.length/itemsPerPage)
        const currentProduct = product.slice(startIndex,endIndex)
        // console.log("currentProduct",currentProduct.length)
        let additionalQueryParameter = clicked ? `clicked=${clicked}` : "";
        res.render("searchedProducts",{product:currentProduct,totalPages:totalPages,currentPage,baseRoute:"/categoryFilter",additionalQueryParameter,allPrdoucts:product,sortPage:sortPage})


     }
  } catch (error) {
    console.error("Error in  category:", error);
   
    next(error)

  }
}
 



const userController = { 
  guestUser,
  loginload,
  loadSignUp,
  insertUser,
  loginHome,
  userHome,
  productView,
  viewCart,
  logout,
  displaySize,
  profile,
  editUserProfile,
  search,
  nav,
  filteredBrand,
  pricefiltered,
  categoryFilter,
  forgotPassword,
  updatingPassword
};

module.exports = userController;
