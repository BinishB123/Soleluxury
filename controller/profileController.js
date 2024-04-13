const productModel =require("../model/productModel")
const userModel = require("../model/userModel")
const bcrypt = require("bcryptjs")





const addAddress = async(req,res,next)=>{
    try {
     
        const id = req.query.id
       
          const user = await userModel.findById(id)
          const address = user.address.push({
                        name: req.body.addresName,
                        mobile:req.body.addressmobile,
                        housName:req.body.housename,
                        pincode:req.body.pincode,
                        CityOrTown:req.body.townOrCity,
                        district:req.body.district,
                        state:req.body.state,
                        country:req.body.country
       
                        })
                        await user.save();
                        
                        
            res.redirect(req.session.prevUrl||"/profile")
      
    } catch (error) {
      console.error("Error in  addaddress:", error);
   
    next(error)
    }
  }


const editAddresspage =  async(req,res,next)=>{
  try {
    if (req.session.user) {
      const addressId = req.query.id
    const userId = req.query.userid
    const user = await userModel.findById(userId);
    const addressToEdit = user.address.find(address => address._id == addressId);
    

  
    res.render("editaddress",{address:addressToEdit})
    }else{
      res.redirect("/login")
    }
    
    
  } catch (error) {
    console.error("Error in  editaddresspage:", error);
   
    next(error)
    
  }
}

const editaddress = async(req,res,next)=>{
  try {
    const addressId = req.query.id
    const userId = req.session.user._id

    const user =  await userModel.findById(userId)
    
    const addressArrayIndex = user.address.findIndex((address)=>{
        return address._id.toString()===addressId }
         )
         



         user.address[addressArrayIndex].name =req.body.addresName,
         user.address[addressArrayIndex].mobile = req.body.addressmobile,
         user.address[addressArrayIndex].housName =req.body.housename,
         user.address[addressArrayIndex].pincode = req.body.pincode,
         user.address[addressArrayIndex].CityOrTown =req.body.townOrCity,
         user.address[addressArrayIndex].district =req.body.district,
         user.address[addressArrayIndex].state = req.body.state
         user.address[addressArrayIndex].country=req.body.country,
         await user.save()
         

               res.redirect('/profile')
  } catch (error) {
    console.error("Error in  editaddress:", error);
   
    next(error)
  }
}

const changePassword = async(req,res,next)=>{
  try {
    // console.log("in chnge password")
    if (req.session.user) {
      
      const userId = req.session.user._id
      const user = await userModel.findOne({_id:userId})
      
     
    
      const newPassword = await bcrypt.hash(req.body.confirmpassword, 10);

      const passwordCheck = await bcrypt.compare(req.body.currentpassword,user.password)
         
      if (passwordCheck) {
        const updated =  await userModel.updateOne({ _id: userId }, { $set: { password: newPassword } });
       
       return res.redirect("/profile")
      }

    }else{
      res.redirect("/login")
    }
    
  } catch (error) {
    console.error("Error in  changepassword:", error);
   
    next(error)
  }

}

const deleteAddress = async (req,res,next)=>{
  try {
    const addressId = req.query.id
    const userId = req.session.user._id
    const addressDeleted = await userModel.updateOne(
      {_id:userId},
      {$pull:{address:{_id:addressId}}}
    )
     if (addressDeleted) {
      res.json({success:true})
     }else{
      res.json({success:false})
     }
  } catch (error) {
    console.error("Error in  deleteaddress:", error);
   
    next(error)
  }

}

const addAddressPage = async(req,res,next)=>{
  try {

    if(req.session.user){
      const user = await userModel.findOne({_id:req.session.user._id})
      req.session.prevUrl =  req.headers.referer
     res.render("addAddress",{user:user})
    }else{
      res.redirect("/login")
    }
  } catch (error) {
    console.error("Error in  addaddresspage:", error);
   
    next(error)
  }
}



const changeEmailid = async(req,res,next)=>{
  try {
    // console.log("in change email id")
      const userId = req.session.user._id
      const user = await userModel.findById(userId)
      const newemail = req.body.newemail
      if(req.session.otpmatched===true){
      if (user.email!= newemail) {
       const updateEmail = await userModel.updateOne({_id:userId},{$set:{email:newemail}})
       req.flash("message","Email updated succesfully")
       res.redirect('/profile')
        
      }else{
        req.flash("errormessage","cannot update the existing email ,Enter a new Email")
        res.redirect('/profile')
        // console.log("email notupdated")
      }
    }else{
      req.flash("errormessage","otp verification failed cannot update the email")
      res.redirect('/profile')
      // console.log("email otpmatch")
    }
      
      
     
    
  } catch (error) {
    console.error("Error in  changeemailid:", error);
   
    next(error)
  }
}














  const profileController = {
    addAddressPage,
    addAddress,
    editAddresspage,
    editaddress,
    changePassword,
    deleteAddress,
    changeEmailid
  }
  module.exports = profileController