const productOfferModel = require("../model/productOfferModel");
const categoryOfferModel = require("../model/categoryOfferModel");

const findOffer = (products) => {
  return new Promise(async (resolve, reject) => {
    try {
      const date = new Date();
      const activeProducts = await   activeProductOffer(date)
      console.log("activeproducts",activeProducts)
      const activeCategories = await activeCategoryOffer(date)
    //   console.log("active category",activeCategories)
      
      for(let i = 0;i<products.length;i++){
        const productOffer = activeProducts.find((item)=>{
             return item.productOffer.product.toString()===products[i]._id.toString()
        })
        
     
        const categoryOffer = activeCategories.find((item)=>{
            return item.categoryOffer.category.toString()===products[i].category._id.toString()

        })
       
           if (productOffer!=undefined&&categoryOffer!= undefined) {
                
              if (productOffer.productOffer.discount > categoryOffer.categoryOffer.discount) {
                
                 products[i].salePrice= Math.round(products[i].regularPrice-(products[i].regularPrice*productOffer.productOffer.discount)/100)
              }else{
                products[i].salePrice= Math.round(products[i].regularPrice-(products[i].regularPrice*categoryOffer.categoryOffer.discount)/100)
              }
           }else if (productOffer!=undefined) {
            products[i].salePrice= Math.round(products[i].regularPrice-(products[i].regularPrice*productOffer.productOffer.discount)/100)

           }else if (categoryOffer!=undefined) {
            products[i].salePrice= Math.round(products[i].regularPrice-(products[i].regularPrice*categoryOffer.categoryOffer.discount)/100)

           }else{
            products[i].salePrice= Math.round(products[i].regularPrice-(products[i].regularPrice*products[i].discount)/100)

           }
      }
      // console.log("helper product",products)
       resolve(products)
    } catch (error) {}
  });
};



const productViewOffer = (product) => {
    return new Promise(async (resolve, reject) => {
        try {  
            const date = new Date();
            const activeProducts = await activeProductOffer(date);
            const activeCategories = await activeCategoryOffer(date);
            const productOffer = activeProducts.find((item) => {
                return item.productOffer.product.toString() === product._id.toString();
            });

            const categoryOffer = activeCategories.find((item) => {
              
                return item.categoryOffer.category.toString() === product.category.toString();
            });
            // console.log("product offi",productOffer)
            // console.log("cat off",categoryOffer)

            if (productOffer !== undefined && categoryOffer !== undefined) {
                if (productOffer.productOffer.discount > categoryOffer.categoryOffer.discount) {
                    product.salePrice = Math.round(product.regularPrice - (product.regularPrice * productOffer.productOffer.discount) / 100);
                } else {
                    product.salePrice = Math.round(product.regularPrice - (product.regularPrice * categoryOffer.categoryOffer.discount) / 100);
                }
            } else if (productOffer !== undefined) {
                product.salePrice = Math.round(product.regularPrice - (product.regularPrice * productOffer.productOffer.discount) / 100);
            } else if (categoryOffer !== undefined) {
                product.salePrice = Math.round(product.regularPrice - (product.regularPrice * categoryOffer.categoryOffer.discount) / 100);
            } else {
                product.salePrice = Math.round(product.regularPrice - (product.regularPrice * product.discount) / 100);
            }
            

            resolve(product); // Resolve the promise with the modified product
        } catch (error) {
            reject(error); // Reject the promise if an error occurs
        }
    });
};


const secondfindOffer = (products) => {
    return new Promise(async (resolve, reject) => {
        try {
            const date = new Date();
            const activeProducts = await activeProductOffer(date);
            const activeCategories = await activeCategoryOffer(date);
            
            for (let i = 0; i < products.length; i++) {
                const productOffer = activeProducts.find((item) => {
                    return item.productOffer.product.toString() === products[i].product._id.toString();
                });
             
                const categoryOffer = activeCategories.find((item) => {
                    return item.categoryOffer.category.toString() === products[i].product.category._id.toString();
                });
                
                if (productOffer !== undefined && categoryOffer !== undefined) {
                    if (productOffer.productOffer.discount > categoryOffer.categoryOffer.discount) {
                        products[i].salePrice = Math.round(products[i].product.regularPrice - (products[i].product.regularPrice * productOffer.productOffer.discount) / 100);
                    } else {
                        products[i].salePrice = Math.round(products[i].product.regularPrice - (products[i].product.regularPrice * categoryOffer.categoryOffer.discount) / 100);
                    }
                } else if (productOffer !== undefined) {
                    products[i].salePrice = Math.round(products[i].product.regularPrice - (products[i].product.regularPrice * productOffer.productOffer.discount) / 100);
                } else if (categoryOffer !== undefined) {
                    products[i].salePrice = Math.round(products[i].product.regularPrice - (products[i].product.regularPrice * categoryOffer.categoryOffer.discount) / 100);
                } else {
                    products[i].salePrice = Math.round(products[i].product.regularPrice - (products[i].product.regularPrice * products[i].product.discount) / 100);
                    console.log(products[i].discount)
                }
            }
            resolve(products);
        } catch (error) {
            reject(error);
        }
    });
};


        
  

function activeProductOffer  (date) {
  return new Promise(async (resolve, reject) => {
    const offers = await productOfferModel.find({
        startingDate: { $lte: date },
        endingDate: { $gte: date },
        "productOffer.offerStatus": true,
      });
    resolve(offers);
  });
};

 function activeCategoryOffer(date){
    return new Promise(async (resolve, reject) => {
        const offer = await categoryOfferModel.find({
          startingDate: { $lte: date },
          endingDate: { $gte: date },
          "categoryOffer.offerStatus": true,
        });
        resolve(offer);
      });
}




const SearchfindOffer = (products) => {
    return new Promise(async (resolve, reject) => {
      try {
        const date = new Date();
        const activeProducts = await   activeProductOffer(date)
        console.log("activeproducts",activeProducts)
        const activeCategories = await activeCategoryOffer(date)
      //   console.log("active category",activeCategories)
        
        for(let i = 0;i<products.length;i++){
          const productOffer = activeProducts.find((item)=>{
               return item.productOffer.product.toString()===products[i]._id.toString()
          })
          
       
          const categoryOffer = activeCategories.find((item)=>{
              return item.categoryOffer.category.toString()===products[i].category.toString()
  
          })
         
             if (productOffer!=undefined&&categoryOffer!= undefined) {
                  
                if (productOffer.productOffer.discount > categoryOffer.categoryOffer.discount) {
                  
                   products[i].salePrice= Math.round(products[i].regularPrice-(products[i].regularPrice*productOffer.productOffer.discount)/100)
                }else{
                  products[i].salePrice= Math.round(products[i].regularPrice-(products[i].regularPrice*categoryOffer.categoryOffer.discount)/100)
                }
             }else if (productOffer!=undefined) {
              products[i].salePrice= Math.round(products[i].regularPrice-(products[i].regularPrice*productOffer.productOffer.discount)/100)
  
             }else if (categoryOffer!=undefined) {
              products[i].salePrice= Math.round(products[i].regularPrice-(products[i].regularPrice*categoryOffer.categoryOffer.discount)/100)
  
             }else{
              products[i].salePrice= Math.round(products[i].regularPrice-(products[i].regularPrice*products[i].discount)/100)
  
             }
        }
        // console.log("helper product",products)
         resolve(products)
      } catch (error) {}
    });
  };
  

const offerHelper = {
  findOffer,
  productViewOffer,
  secondfindOffer
};

module.exports = offerHelper;
