const userModel = require("../model/userModel")

const customerList = async (req, res) => {
    try {
        console.log("The request is in customerList");

       
        const userData = await userModel.find();
        console.log(userData)
    

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
        console.log("The error in customer list is: ", error);
        res.status(500).send("Internal Server Error");
    }
};


const blockUser = async (req, res) => {
    try {
        const id = req.query.id;

      
        if (!id) {
            return res.status(400).json({ error: "Invalid user ID" });
        }
        await userModel.updateOne({ _id: id }, { $set: { isActive: false } });
        delete req.session.user
        res.redirect('/admin/customerlist');
    } catch (error) {
        console.error("Error blocking user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const UnblockUser = async (req, res) => {
    try {
        const id = req.query.id;

      
        if (!id) {
            return res.status(400).json({ error: "Invalid user ID" });
        }
        await userModel.updateOne({ _id: id }, { $set: { isActive: true } });
        res.redirect('/admin/customerlist');
    } catch (error) {
        console.error("Error blocking user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
module.exports = { blockUser };





const customerController = {
    customerList,
    blockUser,
    UnblockUser
}

module.exports = customerController 