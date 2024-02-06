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
        const products = await productModel.find().sort({createdOn:-1}) 
        const message = req.flash("message")
        res.render('adminproducts',{data:products,message:message})
        
    } catch (error) {
        console.log("error is in productsLoad : "+error)
    }
}

const createProductPage = async(req,res)=>{
    try {
        
        const category = await categoryModel.find({islisted:true})
        const brand = await brandModel.find({isBlocked:false})
        res.render('addproducts',{cat:category,brand:brand})
        
    } catch (error) {
      console.log("erro in add products "+error)  
    }
}


const addproducts = async (req, res) => {
    try {
        console.log("admin request in addproducts");

        const product = req.body;
        console.log(product);

       
        const productExist = await productModel.findOne({ productName: product.productName });
        console.log("productExist", productExist);

        if (!productExist) {
            console.log("product does not exist");

            const images = [];

            if (req.files && req.files.length > 0) {
                for (let i = 0; i < req.files.length; i++) {
                    images.push(req.files[i].filename); 
                }
            }

            const productAdding = {
                id: Date.now(),
                brand: product.brand,
                productImage: images,
                productName: product.productName,
                description: product.description,
                category: product.category,
                totalQuantity: product.quantity,
                size: {
                    s: { quantity: product.smallsize },
                    m: { quantity: product.mediumsize },
                    l: { quantity: product.largesize }
                },
                regularPrice: product.regularPrice,
                salePrice: product.salePrice,
                color: product.color,
                createdOn:Date.now()
            };

           
             await productModel.create(productAdding);
            req.flash("message","product added successfully")
            res.redirect("/admin/products")
        } else {
            // Product already exists
            res.redirect("/admin/products");
        }
    } catch (error) {
        console.log("error happened in addproducts:", error);
        res.status(500).json({ error: error.message });
    }
};


const list =async(req,res)=>{
    try {

        const id = req.query.id

        if(!id){
            return res.status(400)
        }
        await productModel.updateOne({_id:id},{$set:{ isBlocked:true}})
        res.redirect('/admin/products')
        
    } catch (error) {
        console.log(error.message)
    }
}

const unList =async(req,res)=>{
    try {

        const id = req.query.id

        if(!id){
            return res.status(400)
        }
        await productModel.updateOne({_id:id},{$set:{ isBlocked:false}})
        res.redirect('/admin/products')
        
    } catch (error) {
        console.log(error.message)
    }
}



const getEditProduct = async(req,res)=>{
    try {
        console.log("admin req now in geteditProduct")
        const id = req.query.id
        console.log(id)
        const findProduct = await productModel.findOne({id:id})
        console.log(findProduct)
        const category = await categoryModel.find({});
        console.log(category)
        const  findBrand = await brandModel.find({})
        console.log(findBrand)
        const message = req.flash("message")
        res.render("editproduct",{product:findProduct,cat:category,brand:findBrand,message:message})

        
    } catch (error) {
        console.log("error found in geteditproduct : "+error.message)
        
    }
}


const deleteImage = async(req,res)=>{
    try {
        console.log("//////////")
        console.log(" req in deleting image of edit product")
        const productId = req.body.productId;
        console.log(" productid : "+productId)
        const productImage =req.body.productImage;
        console.log("productimage : "+productImage)
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
        const data = req.body;
        const images = [];

        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                images.push(req.files[i].filename);
            }
        }

        // Check if a product with the same name exists
        const duplicate = await productModel.findOne({ productName: data.productName });
        console.log(duplicate._id + ":::::::" + id);

            if (req.files.length>0) {
                await productModel.findByIdAndUpdate(id,{
                    productImage:images
                })
            }



            

        if (!duplicate || duplicate._id.toString() === id) {
             
            // Allow updating if it's the same product or the name doesn't exist
            console.log("Yes, product name available or it's the same product.");

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
                    totalQuantity: data.quantity,
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
    list,
    unList,
    getEditProduct,
    deleteImage,
    productUpdate
}

module.exports = productsController