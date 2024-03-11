const walletModel = require("../model/walletModel")


const wallet = async(req,res)=>{
    try {
        const userid = req.session.user._id
        const walletdata = await walletModel.find({userid:userid})
        console.log("wallet",walletdata)
        
    } catch (error) {
       console.log(error.message) 
    }
}


const walletContoller = {
    wallet
}

module.exports= walletContoller