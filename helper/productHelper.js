const product = require("../model/productModel")
const productModel = require("../model/productModel")
const productFiltered = () => {
    return new Promise(async(resolve, reject) => {
        try {
            const products = await product.aggregate([
                {
                    $lookup: {
                        from:"categories",
                         localField:"category",
                      foreignField:"_id",
                      as:"category"
                    }
                },
                {
                    $match: {
                        "category.islisted": true,
                        "isBlocked": false
                    }
                },{
                    $unwind:"$category"
                },
                {$limit:4}
                
            ]);
           
            resolve(products);
        } catch (error) {
            console.log(error.message);
            reject(error);
        }
    });
};


const productHelper ={
    productFiltered,
}

module.exports =productHelper