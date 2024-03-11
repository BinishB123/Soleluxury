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
const bcrypt= require("bcrypt")
const cartHelper = require("../helper/cartHelper");
const product = require("../model/productModel");
const { parse } = require("dotenv");
//loginuser start//






const loginload = function (req, res) {
  console.log("Request come to userloginLoad");  
  if (req.session.user) {
    res.redirect("/home");
  } else {
    const message = req.flash("message")
    res.render("login",{message:message});
  }
};

const loadSignUp = function (req, res) {
  if (req.session.user) {
    res.redirect("/home");    
  } else {
   const message=req.flash("message");
    res.render("signup",{message:message});
  }
};


const insertUser = async (req, res) => {
  try {
    console.log("Request Entered to insertUser");
    console.log(req.body.confirmPassword)
    const response = await userHelper.doSignUp(
      req.body,
      req.session.otpmatched,
      req.session.userEmail
    );
    if (!response.status) {
      const message = response.message;           
      req.flash("message", message);
      res.redirect("/signup");
    } else {
       req.flash("message",response.message)
      res.redirect("/login");
    }
  } catch (err) {}
};




const loginHome = async (req, res) => {
  try {
    const response = await userHelper.loginHome(req.body);
    
    if (response.login) {
      req.session.user = response.user;
     
      res.redirect("/home");
    } else {
      
      res.render("login", { errorMessage: response.loginMessage });
    }
  } catch (error) {
    //console.error('Error in loginHome:', error);
      res.status(500).send('Internal Server Error');
  }
};


const userHome = async(req,res)=>{
  
  if (req.session.user) {
    const product= await productModel.find()
    const productNotBlocked = await productHelper.productFiltered()
    const products = await offerHelper.findOffer(productNotBlocked)
    res.render("home",{data:products,user:req.session.user})
  }else{
    res.redirect('/')
  }
}

const logout = (req,res)=>{
  try{
      req.session.user = null
      res.redirect('/')

  }catch(error){
    console.log(error)
  }
}


const productView = async (req, res) => {
  try {
      const id = req.params.id

      const product = await productModel.findOne({ _id: id })
      // const discountPrice = Math.round(
      //     product.regularPrice - (product.regularPrice * product.discount) / 100
      // );
      const item = await offerHelper.productViewOffer(product)
      // console.log("item.saleprice myree pooffvftbyg8",item.salePrice)
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
              user: req.session.user,
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
      console.log(error.message)
  }
}



const displaySize =async(req,res)=>{
  try {

      if (req.session.user) {
        
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
        
      }else{
        res.json({message:false})
      }
    
  } catch (error) {
    console.log(error.message)
    
  }
}

const guestUser = async(req,res)=>{
  if (!req.session.user) {
    const product= await productModel.find()
    const productNotBlocked = await productHelper.productFiltered()
    const products = await offerHelper.findOffer(productNotBlocked)
    res.render("home",{data:products})
  }else{
    res.redirect("/home")
  }
  
}


const viewCart = async(req, res) => {
  try {
      if (req.session.user) {
          const id = req.session.user._id

          const userCart = await cartModel.findOne({ userId: id })
          let products = []
          
          
             if (userCart) {
              for (let i = 0; i < userCart.items.length; i++) {
              const product = await productModel.findById(userCart.items[i].productId)
              const size = userCart.items[i].size
              const quantity = userCart.items[i].quantity
               const finalProduct = Object.assign({},product.toObject(),{
                size:size
               },
               {quantity:quantity})
              if (product) {
                  products.push(finalProduct)
              }
               }
               for (let i = 0; i < products.length; i++) {
                products[i].salePrice = Math.round(
                  products[i].regularPrice -
                    (products[i].regularPrice * products[i].discount) / 100
                );
              }
             
               const totalPrice = await cartHelper.subtotal(products,id) 

             
               res.render("cart", { products: products,totalPrice:totalPrice})
              
             }else{
              res.render("cart")
             }
          

        
          
      } else {
          res.redirect('/login')
      }

  } catch (error) {
      // Handle error
  }
}



const profile = async(req,res)=>{
  if (req.session.user) {
    const id = req.session.user._id
    const user = await userModel.findOne({_id:id})
    const orderdetail = await orderModel.find({user:id}).sort({orderedOn:-1})
    const walletdata = await walletModel.findOne({userid:id})
   
    
    const message = req.flash("message")
    const errormessage = req.flash("errormessage")
    res.render("profile",{user:user,orderdetail:orderdetail,message:message,errormessage:errormessage,wallet:walletdata}) 
  }else{
    res.redirect("/login")
  }
  
}


const editUserProfile = async(req,res)=>{
  try {
    if (req.session.user) {
      const userId = req.session.user._id
      const user =  await userModel.findOne({_id:userId})
      const passwordCheck = await bcrypt.compare(req.body.password,user.password)
      if (passwordCheck) {
        user.name =req.body.name,
        user.mobile = req.body.mobile,
        await user.save();
        console.log("verified")
        res.redirect("/profile")
        
      }else{
        console.log("not verified")
        res.redirect("/profile")
      }

    }else{
      res.redirect("/login")
    }
    
  } catch (error) {
    console.log(error.message)
  }
}



const search = async(req,res)=>{
  try {
         const searchTerm =req.query.search
        // console.log(searchTerm)
        const searchedThings = await productModel.aggregate([
          {
            $match: {
              $or: [
                { productName: { $regex: new RegExp("^" + searchTerm, "i") } },
                { brand: { $regex: new RegExp("^" + searchTerm, "i") } }
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
        
      const product = await offerHelper.findOffer(searchedThings)
         res.render("searchedProducts",{product:product})
          
  } catch (error) {
    console.log(error.message)
  }
}


const nav = async(req,res)=>{
  try {
    // let clicked = req.query.clicked
    
    
    //  const product = await productModel.aggregate([
    //   {$lookup:{
    //     from:"categories",
    //     localField:"category",
    //     foreignField:"_id",
    //     as:"categ"
    //   }},
    //   {$unwind:"$categ"},
    //  ])
     
    //  const matchingProducts = product.filter(product => product.categ.name === clicked);
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
    res.render("searchedProducts",{product:products})
    
    
  } catch (error) {
    console.log(error.message)
  }
}


const filteredBrand = async(req,res)=>{
  try {
    const clicked = req.query.brand
    const latest = req.query.latest
       if(latest==="latest"){
        const productsWithCategories = await productModel.aggregate([
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
        
        const products =  await offerHelper.findOffer(product)
        res.render("searchedProducts",{product:products})
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
      
    
      res.render("searchedProducts",{product:products})
    
  } catch (error) {
    console.log(error.message)
  }
}

const pricefiltered = async (req, res) => {
  const clicked = req.query.clicked;
  let productData = req.body.productData;
  
  try {
      productData = JSON.parse(productData);
      // console.log(productData)
      productData = await offerHelper.findOffer(productData)
      // console.log("productDate",productData)
      if (clicked==='lth') {
        const product = productData.sort((a,b)=>{
           return a.salePrice - b.salePrice
        })

        res.render("searchedProducts",{product:product})
        
      }else{
        const product = productData.sort((a,b)=>{
         return b.salePrice - a.salePrice})
          res.render("searchedProducts",{product:product})

      }
     
      
  } catch (error) {
      console.error("Error parsing productData:", error);
  }
  
}


const categoryFilter = async(req,res)=>{
  try {
    const clicked = req.query.clicked
    const productWithcategory = JSON.parse(req.body.category)
    //  console.log(productWithcategory)
   
    if (clicked === "mens") {
      
      const matchedMenscat = productWithcategory.filter(product=>product.category.name=="Mens")
      // console.log("mens",matchedMenscat)
         const product= await offerHelper.findOffer(matchedMenscat)
      res.render("searchedProducts",{product:product})
    
     }else if(clicked === "kids"){
      const matchedMenscat = productWithcategory.filter(product=>product.category.name=="kids")
      const product= await offerHelper.findOffer(matchedMenscat)
      res.render("searchedProducts",{product:product})

     }else if(clicked === "womens"){
      const matchedMenscat = productWithcategory.filter(product=>product.category.name=="Womens")
      const product= await offerHelper.findOffer(matchedMenscat)
      res.render("searchedProducts",{product:product})

     }
  } catch (error) {
    
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
  categoryFilter
};

module.exports = userController;
