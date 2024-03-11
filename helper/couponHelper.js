const couponModel = require("../model/couponModel")


const addingCouponUsedUser = (couponId,userId)=>{
    return new Promise(async(resolve, reject) => {
        try {
            let usedCoupon = await couponModel.findOne({_id:couponId})
           
               usedCoupon.usedByUser.push(userId)
               await usedCoupon.save()
               console.log(usedCoupon)
               resolve(true) 
            
        } catch (error) {
            
        }
    })

}

const couponHelper = {
    addingCouponUsedUser
}
module.exports= couponHelper