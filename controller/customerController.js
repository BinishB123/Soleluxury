const userModel = require("../model/userModel")

const customerList = async (req, res,next) => {
    try {
        // console.log("The request is in customerList");

       
        const userData = await userModel.find();
        // console.log(userData)
    

        if (userData) {
            const itemsPerPage =5
            let currentPage = parseInt(req.query.page) || 1
            let startIndex = (currentPage-1)* itemsPerPage
            let endIndex = startIndex +itemsPerPage
            let totalPages = Math.ceil(userData.length/itemsPerPage)
            const users = userData.slice(startIndex,endIndex)
            
         res.render("customerlist", { users: users ,totalPages:totalPages,currentPage:currentPage});
        } else { 
           
            res.status(403).send("Access denied");
        }
    } catch (error) {
        console.error("Error in customerlist:", error);
       
        next(error)
    }
};


const blockUser = async (req, res,next) => {
    try {
        const id = req.query.id;

      
        if (!id) {
            return res.status(400).json({ error: "Invalid user ID" });
        }
        await userModel.updateOne({ _id: id }, { $set: { isActive: false } });
        delete req.session.user
        res.redirect('/admin/customerlist');
    } catch (error) {
        console.error("Error in blockuser:", error);
       next(error)
    }
};

const UnblockUser = async (req, res,next) => {
    try {
        const id = req.query.id;

      
        if (!id) {
            return res.status(400).json({ error: "Invalid user ID" });
        } 
        await userModel.updateOne({ _id: id }, { $set: { isActive: true } });
        res.redirect('/admin/customerlist');
    } catch (error) {
        console.error("Error in categoryaddpage:", error);
        next(error)
    }
};     
module.exports = { blockUser };     





const customerController = {
    customerList,
    blockUser,
    UnblockUser
}

module.exports = customerController 