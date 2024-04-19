const { now } = require("mongoose")
const productModel = require("../model/productModel")
const productOfferModel = require("../model/productOfferModel");
const offerHelper = require("../helper/offerHelper");
const product = require("../model/productModel");


const productOfferPage = async (req, res, next) => {
  try {
    // Retrieve all product offers and populate associated products
    const offer = await productOfferModel.find({}).populate("productOffer.product");

    // Get the current date and time
    const date = new Date(); 
    
    // Retrieve all products that are not blocked
    const products = await productModel.find({ isBlocked: false });

    // Render the product offer page, passing the offers, products, and date to the view
    const message = req.flash("message")
    const errormessage = req.flash("errormessage")
    res.render("productOffer", { offers: offer, products: products, date: date,message:message,errormessage:errormessage });
  } catch (error) {
    // Handle errors
    console.error("Error in productoffer:", error);
    next(error);
  }
};

const AddProductOffer = async(req,res,next)=>{
    try {
        const name = req.body.offerName.trim()
          const productexist =await productOfferModel.findOne({name:name})
          if(productexist){
            const errormessage = "productoffer exist with same name";
             req.flash("errormessage",errormessage);
             res.redirect("/admin/addproductOffer")
             
          }else{

            const offerCreating = await productOfferModel.create({
                name:req.body.offerName.trim(),
                startingDate:req.body.startDate,
                endingDate:req.body.endDate,
                "productOffer.product":req.body.productName,
                "productOffer.discount":req.body.discountAmount,
                "productOffer.offerStatus":true
            })
              const message = "productoffer addded";
             req.flash("message", message);
             res.redirect("/admin/product-Offer")
          }
        
    } catch (error) {
      console.error("Error in addproductOffer:", error);
   
      next(error)
    }
}

// const editProductOffer = async (req, res,next) => {
//     try {
//         // console.log("okkk")
//         const id = req.params.id;
//         const offer = await productOfferModel.findOne({ _id: id }).lean();
//         offer.formattedStartingDate = formatDate(offer.startingDate);
//         offer.formattedEndingDate = formatDate(offer.endingDate);
  
//         res.json(offer); // Sending the formatted offer as a JSON response
//     } catch (error) {
//       console.error("Error in editproductoffer:", error);
   
//       next(error)
//     }
// }
const productEditOffer = async (req, res, next) => {
  try {
      const name = req.body.editofferName.trim();
      const productExist = await productOfferModel.findOne({ name: name });

      if (productExist && productExist._id.toString() !== req.query.id.toString()) {
        const errormessage = "productoffer exist with same name";
        req.flash("errormessage",errormessage);
          return res.redirect("/admin/product-Offer");
      }

      const updated = await productOfferModel.updateOne({ _id: req.query.id }, {
          $set: {
              name: name,
              startingDate: req.body.startDate,
              endingDate: req.body.editendDate,
              "productOffer.product": req.body.productName,
              "productOffer.discount": req.body.discountAmount,
              "productOffer.offerStatus": true
          }
      });
      const message = "productoffer edited ";
      req.flash("message", message);
      res.redirect("/admin/product-Offer");
  } catch (error) {
      console.error("Error in producteditoffer:", error);
      next(error);
  }
}



const deleteOffer = async(req,res,next)=>{
    try {
        const id = req.query.id 
        const deleteOffer = await productOfferModel.findByIdAndDelete(id);
          if (deleteOffer) {
            res.json({success:true})
          }else{
            res.json({success:false})
          }
        
    } catch (error) {
      console.error("Error in deleteoffer:", error);
   
      next(error)
    }
}


function formatDate(dateString) {
    // Create a Date object from the string
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const addproductOfferPage = async(req,res)=>{
    try {
      const products = await productModel.find({ isBlocked: false });
      const date = new Date(); 
      const errormessage = req.flash("errormessage")
    res.render("addProductOffer", {  products: products, date: date ,errormessage:errormessage});
      
    } catch (error) {
      console.log(error.message)
      next(error)
    }
  }


  const editprodoffpage = async(req,res)=>{
    try {
     
         const id = req.query.id;
         const offer = await productOfferModel.findOne({ _id: id });
         const products = await productModel.find({ isBlocked: false });
         offer.formattedStartingDate = formatDate(offer.startingDate);
         offer.formattedEndingDate = formatDate(offer.endingDate);
        // console.log(offer)
        // console.log(products)
      res.render("editprodoff",{offer:offer,products:products})
      
    } catch (error) {
      console.log("error in edit prod off",error.message)
      // next(error)
    }
  }

const productOfferController = {
    productOfferPage,
    AddProductOffer,
    // editProductOffer,
    productEditOffer,
    deleteOffer,
    addproductOfferPage,
    editprodoffpage
}

module.exports = productOfferController