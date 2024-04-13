const Category = require('../model/categoryModel')
const categoryModel = require('../model/categoryModel')


const categoryPage =  async(req,res,next)=>{
        
      try{
          const category= await categoryModel.find({})
          // console.log(category)
          const message = req.flash("message")
          res.render("categorylist",{category:category,message:message})


      }catch(error){
        console.error("Error in categorypage:", error);
       
        next(error)
      }

}


const categoryEditPage = async(req,res,next)=>{
  try {

      const id = req.query.id
      const category = await categoryModel.findOne({_id:id})
      const message = req.flash("message")
      res.render("editcategory",{category:category,message:message})
    
  } catch (error) {
    console.error("Error in categoryeditpage:", error);
   
    next(error)
    
  }
}

const updateCategory = async (req, res,next) => {
  try {
    const id = req.params.id;
    const category = req.body;
    console.log(category)
    const existingCategory = await categoryModel.findOne({ name: category.categoryName.trim() });
    const cat = await categoryModel.findOne({_id:id})
    console.log(existingCategory)

    if (!existingCategory&&cat._id.toString() === id) {
      const v =category.categoryName.trim()
      await categoryModel.findByIdAndUpdate(id, {
        name: v,
        description: category.description,
      });

      req.flash("message", "Category updated successfully");
      res.redirect("/admin/category");
    } else {
      // console.log("in else")
      req.flash("message", "Category with the same name already exists");
      res.redirect(`/admin/editCategory?id=${id}`);
    }
  } catch (error) {
    console.error("Error in update category:", error.message);
   
    next(error)
   
  }
};
const categoryAddPage = async(req,res,next)=>{
  try {
    const message = req.flash("message")
    res.render("addcategory",{message:message})
         
  } catch (error) {
    console.error("Error in categoryaddpage:", error);
   
    next(error)
  }
}

const addToCategory = async(req,res,next)=>{
  try {
    // console.log("now at add to category")
      const name = req.body.categoryName;
      const description = req.body.description
      

       const categoryExist = await categoryModel.findOne({name:name})
       const n = name.trim()
       if (!categoryExist) {
            const categoryadded = {
              name:n,
              description:description,
              islisted:true
            }   
            
            await categoryModel.create(categoryadded)
            req.flash("message","Category Added successfully")
            res.redirect("/admin/category")
       }else{
        req.flash("message","Category Already exist")
        res.redirect("/admin/addcategory") 
       }
    
  } catch (error) {
    console.error("Error in addtocategory:", error);
   
    next(error)
  }
}



const unlistorlist = async (req, res,next) => {
  try {
      // console.log("req for list or unlist");
      const id = req.query.id;
      // console.log("/////" + id);
      const category = await categoryModel.findById(id);
      // console.log(category);

      if (category.islisted === true) {
          await categoryModel.findByIdAndUpdate(id, {
              islisted: false
          });
          res.json({success:true,flag:0})
      }else{
        await categoryModel.findByIdAndUpdate(id, {
          islisted: true
        
      });
      res.json({success:true,flag:1})
      }

      
  } catch (error) {
    console.error("Error in categorylistorunlist:", error);
   
    next(error)
  }
};



  
const  categoryController = {
    categoryPage,
    categoryEditPage,
    updateCategory,
    categoryAddPage,
    addToCategory,
    unlistorlist
}

module.exports = categoryController