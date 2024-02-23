const userModel = require("../model/userModel");
const userHelper = require("../helper/userHelper");
//const nodemailer = require("nodemailer");
const { response } = require("express");
const productModel = require("../model/productModel")
const productHelper = require("../helper/productHelper")
const cartModel = require("../model/cartModel");
const user = require("../model/userModel");
const orderModel = require("../model/orderModel")
const bcrypt= require("bcrypt")
const cartHelper = require("../helper/cartHelper");
const product = require("../model/productModel");
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
      res.redirect("/");
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
    
    //console.log(product)
    res.render("home",{data:productNotBlocked,user:req.session.user})
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


const productView =  async(req,res)=>{
  try {
    const id = req.params.id
    
    const product = await productModel.findOne({_id:id})
    if (req.session.user) {
          const userId = req.session.user._id
      const productAlreadyInTheCart = await cartModel.findOne({
        userId: userId,
        items: {
            $elemMatch: { productId: id }
        }
    });
    
      res.render("productview",{data:product,
        user:req.session.user,
        productAlreadyInCart:productAlreadyInTheCart
      })
    }else{
      res.render("productview",
      {data:product,
      user:req.session.user})
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
    //console.log(product)
    res.render("home",{data:productNotBlocked})
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
    const message = req.flash("message")
    const errormessage = req.flash("errormessage")
    res.render("profile",{user:user,orderdetail:orderdetail,message:message,errormessage:errormessage}) 
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
         console.log(searchTerm)
         const searchedThings = await productModel.find({
          $or: [
              { productName: { $regex: new RegExp("^" + searchTerm, "i") } },
              { brand: { $regex: new RegExp("^" + searchTerm, "i") } }
          ]
      });
      ;
         res.render("searchedProducts",{product:searchedThings})
          
  } catch (error) {
    console.log(error.message)
  }
}


const nav = async(req,res)=>{
  try {
    let clicked = req.query.clicked
    
     const product = await productModel.aggregate([
      {$lookup:{
        from:"categories",
        localField:"category",
        foreignField:"_id",
        as:"categ"
      }},
      {$unwind:"$categ"},
     ])
     
     const matchingProducts = product.filter(product => product.categ.name === clicked);

    res.render("searchedProducts",{product:matchingProducts})
    
    
  } catch (error) {
    console.log(error.message)
  }
}


const filteredBrand = async(req,res)=>{
  try {
    const clicked = req.query.brand
    const latest = req.query.latest
       if(latest==="latest"){
        const product = await productModel.find().sort({createdOn:-1})
        res.render("searchedProducts",{product:product})
        return
       }
      const product = await productModel.find({brand:clicked})
      
    
      res.render("searchedProducts",{product:product})
    
  } catch (error) {
    console.log(error.message)
  }
}

const pricefiltered = async(req,res)=>{
  try {
   
    const clicked = req.query.clicked
    
      if (clicked==="lth") {
        const product = await productModel.find().sort({salePrice:1})
        res.render("searchedProducts",{product:product})
        
      }else{
        const product = await productModel.find().sort({salePrice:-1})
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
  pricefiltered
};

module.exports = userController;
