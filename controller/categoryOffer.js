const categoryOfferModel = require("../model/categoryOfferModel")
const categoryModel = require("../model/categoryModel")


const categoryOfferPage = async(req,res,next)=>{
    try {
       
                const offer = await categoryOfferModel.find({}).populate("categoryOffer.category")
              const category= await categoryModel.find({islisted:true})

              res.render("categoryOffer",{offers:offer,category :category })
           
    } catch (error) {
        console.error("Error in categoryofferpage:", error);
        
        next(error)

    }
}

const editcategoryOffer = async (req, res,next) => {
    try {
        
        const id = req.params.id;
        // console.log(id)
        const offer = await categoryOfferModel.findOne({ _id: id }).lean();
        offer.formattedStartingDate = formatDate(offer.startingDate);
        offer.formattedEndingDate = formatDate(offer.endingDate);
        //  console.log(offer)
        res.json(offer); // Sending the formatted offer as a JSON response
    } catch (error) {
        console.error("Error in editcategorypage:", error);
   
    next(error)
    }
}


const AddCategoryOffer = async(req,res,next)=>{
    try {
        

            const offerCreating = await categoryOfferModel.create({
                name:req.body.offerName,
                startingDate:req.body.startDate,
                endingDate:req.body.endDate,
                "categoryOffer.category":req.body.productName,
                "categoryOffer.discount":req.body.discountAmount,
                "categoryOffer.offerStatus":true
            })
            // console.log(offerCreating)
      res.redirect("/admin/categoryOffer")
        
    } catch (error) {
        console.error("Error in addcategoryoffer:", error);
       
        next(error)
    }
}

const categoryEditOffer = async(req,res,next)=>{
    try {
        // console.log(req.body);
        const updated = await categoryOfferModel.updateOne({_id:req.body.offerId},
            {$set:{
                name:req.body.editofferName,
                startingDate:req.body.startDate,
                endingDate:req.body.editendDate,
                "categoryOffer.category":req.body.productName,
                "categoryOffer.discount":req.body.discountAmount,
                "categoryOffer.offerStatus":true
            }})
            res.status(200).redirect("/admin/categoryOffer")
    } catch (error) {
        console.error("Error in categoryeditoffer:", error);
   
    next(error)
    }
}



const deleteOffer = async (req, res,next) => {
    try {
        const id = req.query.id;
        
        const deleteOffer = await categoryOfferModel.findByIdAndDelete(id);
        
        if (deleteOffer) {
            // Respond with a 200 OK status code for successful deletion
            res.status(200).json({ success: true });
        } else {
            // Respond with a 404 Not Found status code if the offer to delete was not found
            res.status(404).json({ success: false, message: 'Offer not found' });
        }
        
    } catch (error) {
        console.error("Error in deleteoffercategory:", error);
   
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
const categoryOfferController = {
    categoryOfferPage,
    AddCategoryOffer,
    editcategoryOffer,
    categoryEditOffer,
    deleteOffer
}
module.exports = categoryOfferController