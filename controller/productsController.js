const productModel = require("../model/productModel")
const brandModel = require('../model/brandModel')
const categoryModel = require('../model/categoryModel')
const { errorMonitor } = require("nodemailer/lib/xoauth2")
const brand = require("../model/brandModel")
const { findOne } = require("../model/adminModel")
const fs = require("fs")
const path = require("path")
const product = require("../model/productModel")

const productsLoad =async (req,res)=>{
    

    try {
        const products = await productModel.aggregate([{$lookup:{
            from:"categories",
            localField:"category",
            foreignField:"_id",
            as:"category"
        }}])
        const message = req.flash("message")
        const errormessage = req.flash("errormessage")
        res.render('adminproducts',{data:products,message:message,errormessage:errormessage})
        
    } catch (error) {
        console.log("error is in productsLoad : "+error)
    }
}

const createProductPage = async(req,res)=>{
    try {
        if (req.session.admin) {
            const category = await categoryModel.find({islisted:true})
            const brand = await brandModel.find({isBlocked:false})
            const errormessage = req.flash("errormessage")
            res.render('addproducts',{cat:category,brand:brand,errormessage:errormessage})
            
        }else{
            res.redirect("/admin/login")
        }
      
        
    } catch (error) {
      console.log("erro in add products "+error)  
    }
}


const addproducts = async (req, res) => {
    try {
      
        const product = req.body;
        

       
        const productExist = await productModel.findOne({ productName: product.productName });
      

        if (!productExist) {
            console.log("product does not exist");
        
            const images = [];
        
            if (req.files && req.files.length > 0) {
                // Image validation
                for (let i = 0; i < req.files.length; i++) {
                    const file = req.files[i];
                    // Check if the file is an image
                    if (!file.mimetype.startsWith('image/')) {
                        console.log("File MIME Type:", file.mimetype);

                        const errormessage ="Cannot Add product please upload images only";
                        return res.json({ success: false, fileerrormessage:errormessage }); // Terminate function execution

                    }
                    // Add filename to the images array
                    images.push(file.filename);
                }
            }
        
            const productAdding = {
                id: Date.now(),
                brand: product.brand,
                productImage: images,
                productName: product.productName,
                description: product.description,
                category: product.category,
                size: {
                    s: { quantity: product.smallsize },
                    m: { quantity: product.mediumsize },
                    l: { quantity: product.largesize }
                },
                regularPrice: product.regularPrice,
                salePrice: product.salePrice,
                color: product.color,
                createdOn: Date.now()
            };
        
            await productModel.create(productAdding);
            
            const message="product added successfully";
            return res.json({success:true,message:message}) // Terminate function execution
        } else {
            // Product already exists
            const errormessage ="Cannot Add product Already exist";
             return res.json({ success: false, errormessage:errormessage }); // 
        }
        
    } catch (error) {
        console.log("error happened in addproducts:", error);
        res.status(500).json({ error: error.message });
    }
};


const  blockOrUnblockproduct= async (req, res) => {
    try {
        const id = req.query.id;
        const product = await productModel.findOne({ _id: id });

        if (!id || !product) {
            return res.status(400).json({ success: false, message: 'Invalid product ID' });
        }

        if (product.isBlocked === false) {
            await productModel.updateOne({ _id: id }, { $set: { isBlocked: true } });
            return res.json({ success: true, flag: 1 });
        } else { 
            await productModel.updateOne({ _id: id }, { $set: { isBlocked: false } });
            return res.json({ success: true, flag: 0 });
        }
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};






const getEditProduct = async(req,res)=>{
    try {
       
        const id = req.query.id
   
        const findProduct = await productModel.findOne({id:id})
    
        const category = await categoryModel.find({});
    
        const  findBrand = await brandModel.find({})
    
        const message = req.flash("message")
        
        res.render("editproduct",{product:findProduct,cat:category,brand:findBrand,message:message,})

        
    } catch (error) {
        consol.log("error found in geteditproduct : "+error.message)
        
    }
}


const deleteImage = async(req,res)=>{
    try {
       // console.log("//////////") 
        console.log(" req in deleting image of edit product")
        const productId = req.body.productId;
        //console.log(" productid : "+productId)
        const productImage =req.body.productImage;
       // console.log("productimage : "+productImage)
        const deleted = await productModel.findByIdAndUpdate(productId,{$pull:{productImage:productImage}})
        const imagePath = path.join("public","photos","productImages",productImage)

        if (fs.existsSync(imagePath)) {
          await  fs.unlinkSync(imagePath)
          console.log(`image ${productImage}is deleted successfully`)
          res.json({success:true})
            
        }else{
            console.log(`Image ${image} not found`);
        }
         

        
    } catch (error) {

        console.log("error catched  in deleteimage: "+error.message)
        
    }
}



const productUpdate = async (req, res) => {
    try {
        console.log("req now in productUpdate ");
        const id = req.params.id;
        console.log(id)
        const data = req.body;
        const images = [];
        console.log(data.productName)

        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                images.push(req.files[i].filename);
            }
        }

        // Check if a product with the same name exists
        const duplicate = await productModel.findOne({ productName: data.productName });
       
            if (req.files.length>0) {
                // await productModel.findByIdAndUpdate(id,{
                //     productImage:images
                // })
                const prodata = await productModel.findById({_id:id})
                prodata.productImage.push(...images)
                prodata.save()
                console.log(prodata.productImage);
            }



            

        if (!duplicate || duplicate._id.toString() === id) {
             
            // Allow updating if it's the same product or the name doesn't exist
            console.log("Yes product name available or it's the same product.");

            // Update product data
            await productModel.findByIdAndUpdate(
                id,
                {
                    productName: data.productName,
                    description: data.description,
                    brand: data.brand,
                    category: data.category,
                    regularPrice: data.regularPrice,
                    salePrice: data.salePrice,
                    size: {
                        s: { quantity: data.ssize },
                        m: { quantity: data.msize },
                        l: { quantity: data.lsize },
                    },
                    color: data.color,
                  
                },
                { new: true }
            );

           
            req.flash("message", "Product Edit successfully");
            res.redirect("/admin/products");
        } else {
            req.flash("message", "Product exists with the same name. Please choose a different name.");
            res.redirect(`/admin/editproduct?id=${duplicate.id}`);
        }
    } catch (error) {
        console.log("Error message when updating : " + error.message);
    }
};


const productsController = {
    productsLoad,
    createProductPage,
    addproducts,
    blockOrUnblockproduct,
    getEditProduct,
    deleteImage,
    productUpdate
}

module.exports = productsController