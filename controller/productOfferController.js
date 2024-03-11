const productModel = require("../model/productModel")
const productOfferModel = require("../model/productOfferModel")


const productOfferPage = async(req,res)=>{
    try {
        const offer = await productOfferModel.find({}).populate("productOffer.product")
        console.log(offer)
        
      const products= await productModel.find({isBlocked:false})
      res.render("productOffer",{offers:offer,products :products })
      
    } catch (error) {
      console.log(error.message)
    }
  } 

const AddProductOffer = async(req,res)=>{
    try {
        

            const offerCreating = await productOfferModel.create({
                name:req.body.offerName,
                startingDate:req.body.startDate,
                endingDate:req.body.endDate,
                "productOffer.product":req.body.productName,
                "productOffer.discount":req.body.discountAmount,
                "productOffer.offerStatus":true
            })
      res.redirect("/admin/product-Offer")
        
    } catch (error) {
       console.log(error.message) 
    }
}

const editProductOffer = async (req, res) => {
    try {
        
        const id = req.params.id;
        const offer = await productOfferModel.findOne({ _id: id }).lean();
        offer.formattedStartingDate = formatDate(offer.startingDate);
        offer.formattedEndingDate = formatDate(offer.endingDate);

        res.json(offer); // Sending the formatted offer as a JSON response
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
}
const productEditOffer = async(req,res)=>{
    try {
        console.log(req.body);
        const updated = await productOfferModel.updateOne({_id:req.body.offerId},
            {$set:{
                name:req.body.editofferName,
                startingDate:req.body.startDate,
                endingDate:req.body.editendDate,
                "productOffer.product":req.body.productName,
                "productOffer.discount":req.body.discountAmount,
                "productOffer.offerStatus":true

            }})
            res.redirect("/admin/product-Offer")
    } catch (error) {
        console.log(error.message)
    }
}


const deleteOffer = async(req,res)=>{
    try {
        const id = req.query.id 
        const deleteOffer = await productOfferModel.findByIdAndDelete(id);
          if (deleteOffer) {
            res.json({success:true})
          }else{
            res.json({success:false})
          }
        
    } catch (error) {
       console.log(error.message) 
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

const productOfferController = {
    productOfferPage,
    AddProductOffer,
    editProductOffer,
    productEditOffer,
    deleteOffer
}

module.exports = productOfferController