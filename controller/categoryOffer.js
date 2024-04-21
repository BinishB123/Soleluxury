const categoryOfferModel = require("../model/categoryOfferModel")
const categoryModel = require("../model/categoryModel")


const categoryOfferPage = async(req,res,next)=>{
    try {
         const message = req.flash("message")
         const errormessage = req.flash("errormessage")
        
                const offer = await categoryOfferModel.find({}).populate("categoryOffer.category")
              const category= await categoryModel.find({islisted:true})

              res.render("categoryOffer",{offers:offer,category :category ,message:message,errormessage:errormessage})
           
    } catch (error) {
        console.error("Error in categoryofferpage:", error);
        
        next(error)

    }
}

const editcategoryOffer = async (req, res, next) => {
    try {
        const id = req.query.id;
        const offer = await categoryOfferModel.findOne({ _id: id });

        const category = await categoryModel.find({ islisted: true });

        offer.formattedStartingDate = formatDate(offer.startingDate);
        offer.formattedEndingDate = formatDate(offer.endingDate);
        const date = new Date();

        res.render("editcatoff", { offer: offer, date: date, category: category });
    } catch (error) {
        console.error("Error in editcategorypage:", error);
        next(error);
    }
}



const AddCategoryOfferPage = async(req,res,next)=>{
    try {
       const errormessage = req.flash("errormessage")
        
        const category= await categoryModel.find({islisted:true})
         const date = new Date()
        res.render("addcatoff",{category:category,date:date,errormessage:errormessage})

   
        
    } catch (error) {
        console.error("Error in addcategoryoffer:", error);
       
        next(error)
    }
}

const categoryEditOffer = async(req,res,next)=>{
    try {
        // console.log(req.body);
        const name = req.body.editofferName.trim()
        const offerexistname = await categoryOfferModel.findOne({name:name})
        if (offerexistname) {
            const errormessage = "cannot edit given offer name exist";
            req.flash("errormessage", errormessage);
            res.redirect("/admin/categoryOffer")
        }else{
        const updated = await categoryOfferModel.updateOne({_id:req.body.offerId},
            {$set:{
                name:req.body.editofferName,
                startingDate:req.body.startDate,
                endingDate:req.body.editendDate,
                "categoryOffer.category":req.body.productName,
                "categoryOffer.discount":req.body.discountAmount,
                "categoryOffer.offerStatus":true
            }})
            const message = "Categoryoffer addded";
           req.flash("message", message);
            res.status(200).redirect("/admin/categoryOffer")
        }
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


const addcategoryoffer = async(req,res)=>{
    try {
        const name = req.body.offerName.trim()
        const offernameexist = await categoryOfferModel.findOne({name:name})
        if (offernameexist) {
            const errormessage = "categoryoffer same name exist cannot add";
            // console.log(errormessage)
             req.flash("errormessage", errormessage);
            res.redirect("/admin/categoryOffer")
        }else{
        const offerCreating = await categoryOfferModel.create({
            name:name,
            startingDate:req.body.startDate,
            endingDate:req.body.endDate,
            "categoryOffer.category":req.body.productName,
            "categoryOffer.discount":req.body.discountAmount,
            "categoryOffer.offerStatus":true
        })
        const message = "Categoryoffer addded";
        req.flash("message", message);
      res.redirect("/admin/categoryOffer")
    } 
    } catch (error) {
       console.log(error.message) 
       next(error)
    }
}
const categoryOfferController = {
    categoryOfferPage,
    AddCategoryOfferPage,
    editcategoryOffer,
    categoryEditOffer,
    deleteOffer,
    addcategoryoffer
}
module.exports = categoryOfferController