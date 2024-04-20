const productModel = require("../model/productModel")
const brandModel = require('../model/brandModel')
const categoryModel = require('../model/categoryModel')
const { errorMonitor } = require("nodemailer/lib/xoauth2")
const brand = require("../model/brandModel")
const { findOne } = require("../model/adminModel")
const fs = require("fs")
const path = require("path")
const sharp = require("sharp")
const product = require("../model/productModel")
const { File } = require("buffer")

const productsLoad =async (req,res)=>{
    

    try {
        
        const noOfProduct =  await productModel.find({isBlocked:false}).count()
        const products = await productModel.aggregate([
            {$lookup:{
                from:"categories",
                localField:"category",
                foreignField:"_id",
                as:"category"
            }},
           
        ])
        let itemsPerPage = 10
        let currentPage = parseInt(req.query.page) || 1
        let startIndex = (currentPage-1)* itemsPerPage
        let endIndex = startIndex +itemsPerPage
        let totalPages = Math.ceil(products.length/itemsPerPage)
        const currentProduct = products.slice(startIndex,endIndex)
        const message = req.flash("message")
        const errormessage = req.flash("errormessage")
        res.render('adminproducts',{data:currentProduct,message:message,errormessage:errormessage,totalPages:totalPages,currentPage:currentPage})
        
    } catch (error) {
        console.log("error is in productsLoad : "+error)
        res.status(500).json({ success: false, message: 'Internal Server Error' });

    }
}

const createProductPage = async(req,res,next)=>{
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
        console.error("Error in createproductpage:", error);
   
        next(error)

    }
}


const addproducts = async (req, res, next) => {
    try {
        const product = req.body;
        let productName = req.body.productName.trim();
        const { hiddenField1, hiddenField2, hiddenField3, hiddenField4, hiddenField5 } = req.body;

        const productExist = await productModel.findOne({ productName: productName });

        if (productExist) {
            const message = "Cannot add duplicate product, product exists with the same name";
            return res.json({ status: false, message: message });
        }

        const images = [];

        if (req.files && req.files.length > 0) {
            // Image validation
            for (let i = 0; i < req.files.length; i++) {
                const file = req.files[i];
                // Check if the file is an image
                if (!file.mimetype.startsWith('image/')) {
                    const errormessage = "Cannot add product, please upload images only";
                    return res.json({ success: false, fileerrormessage: errormessage });
                }
                images.push(file.filename);
            }
        }

        const productAdding = {
            id: Date.now(),
            brand: product.brand,
            productImage: images,
            productName: productName,
            description: product.description,
            category: product.category,
            size: {
                s: { quantity: product.smallsize },
                m: { quantity: product.mediumsize },
                l: { quantity: product.largesize }
            },
            regularPrice: product.regularPrice,
            discount: product.discount,
            color: product.color,
            createdOn: Date.now()
        };

        const newProduct = await productModel.create(productAdding);

        // Array to store promises for cropping operations
        const cropPromises = [];

        // Define cropImage function
        async function cropImage(hiddenfield) {
            return new Promise((resolve, reject) => {
                let parts = hiddenfield.split(" ");
                let ind = parseInt(parts[1]);
                let x = parseInt(parts[3]);
                let y = parseInt(parts[5]);
                let width = parseInt(parts[7]);
                let height = parseInt(parts[9]);
        
                let filename = newProduct.productImage[ind];
                let inputPath = path.join(__dirname, `../public/photos/productImages/${filename}`);
                let outputPath = path.join(__dirname, `../public/photos/productImages/cropped_${filename}`);
        
                sharp(inputPath)
                    .extract({ left: x, top: y, width: width, height: height })
                    .toFile(outputPath, (err) => {
                        if (err) {
                            console.error("Error cropping image:", err);
                            reject(err);
                        } else {
                            // Update the product image path with the cropped image
                            let croppedFilename = `cropped_${filename}`;
                            newProduct.productImage[ind] = croppedFilename;
        
                            // try {
                            //     // Attempt to unlink the file
                            //     fs.unlinkSync(inputPath);
                            //     console.log('File unlinked successfully');
                            // } catch (err) {
                            //     // Handle the error
                            //     console.error('Error unlinking file:', err);
                            //     // You can take further action here, such as retrying or notifying the user
                            // }
                            // // Resolve the promise
                            resolve();
                        }
                    });
            });
        }
        

        // Push crop promises to array
        if (hiddenField1) {
            cropPromises.push(cropImage(hiddenField1));
        }
        if (hiddenField2) {
            cropPromises.push(cropImage(hiddenField2));
        }
        if (hiddenField3) {
            cropPromises.push(cropImage(hiddenField3));
        }
        if (hiddenField4) {
            cropPromises.push(cropImage(hiddenField4));
        }
        if (hiddenField5) {
            cropPromises.push(cropImage(hiddenField5));
        }

        // Wait for all crop promises to resolve
        await Promise.all(cropPromises);

        // Save the updated product after all cropping operations
        await newProduct.save();

        const message = "Product added successfully";
        return res.json({ success: true, message: message });

    } catch (error) {
        console.error("Error in addproducts:", error);
        next(error);
    }
};






 

const  blockOrUnblockproduct= async (req, res,next) => {
    try {
        const id = req.query.id;
        const product = await productModel.findOne({ _id: id });

        if (!id || !product) {
            return res.status(400).json({ success: false, message: 'Invalid product ID' });
        }
        // product.isBlocked = !product.isBlocked
        // await productModel.save()

        if (product.isBlocked === false) {
            // console.log("came")
            await productModel.updateOne({ _id: id }, { $set: { isBlocked: true } });
            return res.json({ success: true, flag: 1 });
        } else { 
            await productModel.updateOne({ _id: id }, { $set: { isBlocked: false } });
            return res.json({ success: true, flag: 0 });
        }
    } catch (error) {
        console.error("Error in  block or unblockproduct:", error);
   
    next(error)
    }
};






const getEditProduct = async(req,res,next)=>{
    try {
       
        const id = req.query.id
   
        const findProduct = await productModel.findOne({id:id})
    
        const category = await categoryModel.find({});
    
        const  findBrand = await brandModel.find({})
    
        const message = req.flash("message")
        
        res.render("editproduct",{product:findProduct,cat:category,brand:findBrand,message:message,})

        
    } catch (error) {
        console.error("Error in  geteditproduct:", error);
   
    next(error)
    }
}


const deleteImage = async(req,res,next)=>{
    try {
       // console.log("//////////") 
        // console.log(" req in deleting image of edit product")
        const productId = req.body.productId;
        //console.log(" productid : "+productId)
        const productImage =req.body.productImage;
       // console.log("productimage : "+productImage)
        const deleted = await productModel.findByIdAndUpdate(productId,{$pull:{productImage:productImage}})
        const imagePath = path.join("public","photos","productImages",productImage)

        if (fs.existsSync(imagePath)) {
          await  fs.unlinkSync(imagePath)
        //   console.log(`image ${productImage}is deleted successfully`)
          res.json({success:true})
            
        }else{
            //console.log(`Image ${image} not found`);
            res.json({success:FontFaceSetLoadEvent})
        }
         

        
    } catch (error) {

        console.error("Error in  block or deleteimage:", error);
   
    next(error)
        
    }
}



const productUpdate = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { hiddenField1, hiddenField2, hiddenField3, hiddenField4, hiddenField5 } = req.body;
        const data = req.body;

        const images = [];

        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                images.push(req.files[i].filename);
            }
        }

        const productName = data.productName.trim();

        // Check if a product with the same name exists
        const duplicate = await productModel.findOne({ productName: productName, _id: { $ne: id } });
        const prodata = await productModel.findById(id);

        if (req.files.length > 0) {
           
            prodata.productImage.push(...images);
            await prodata.save();
        }

        // Update product data if no duplicate or same product
        if (!duplicate || duplicate._id.toString() === id) {
            const updateData = {
                productName: data.productName,
                description: data.description,
                brand: data.brand,
                category: data.category,
                regularPrice: data.regularPrice,
                discount: data.discount,
                size: {
                    s: { quantity: data.ssize },
                    m: { quantity: data.msize },
                    l: { quantity: data.lsize },
                },
                color: data.color,
            };

            // Crop images asynchronously
            const cropPromises = [];

            const cropFields = [hiddenField1, hiddenField2, hiddenField3, hiddenField4, hiddenField5];
            cropFields.forEach(async (field, index) => {
                if (field) {
                    cropPromises.push(cropImage(req, id, field, prodata.productImage[index]));
                }
            });

            // Wait for all crop promises to resolve
            await Promise.all(cropPromises);
            await prodata.save

            // Update product data
            await productModel.findByIdAndUpdate(id, updateData, { new: true });

            req.flash("message", "Product edited successfully");
            res.redirect("/admin/products");
        } else {
            req.flash("message", "A product with the same name already exists. Please choose a different name.");
            res.redirect(`/admin/editproduct?id=${duplicate.id}`);
        }
    } catch (error) {
        console.error("Error in productUpdate:", error.message);
        next(error);
    }
};

// Function to crop an image
async function cropImage(req, productId, hiddenField, filename) {
    const parts = hiddenField.split(" ");
    const x = Math.round(parseFloat(parts[3]));
    const y = Math.round(parseFloat(parts[5]));
    const width = Math.round(parseFloat(parts[7]));
    const height = Math.round(parseFloat(parts[9]));

    const inputPath = path.join(__dirname, `../public/photos/productImages/${filename}`);
    const outputPath = path.join(__dirname, `../public/photos/productImages/cropped_${filename}`);

    try {
        await sharp(inputPath)
            .extract({ left: x, top: y, width: width, height: height })
            .toFile(outputPath);
        console.log("Image cropped successfully");
    } catch (err) {
        console.error("Error cropping image:", err.message);
    }
}






const productsController = {
    productsLoad,
    createProductPage,
    addproducts,
    blockOrUnblockproduct,
    getEditProduct,
    deleteImage,
    productUpdate,

}

module.exports = productsController