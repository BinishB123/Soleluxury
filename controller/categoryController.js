const Category = require('../model/categoryModel')
const categoryModel = require('../model/categoryModel')


const categoryPage =  async(req,res)=>{
        
      try{
          const category= await categoryModel.find({})
          console.log(category)
          const message = req.flash("message")
          res.render("categorylist",{category:category,message:message})


      }catch(error){
        console.log(error.message)
      }

}


const categoryEditPage = async(req,res)=>{
  try {

      const id = req.query.id
      const category = await categoryModel.findOne({_id:id})
      res.render("editcategory",{category:category})
    
  } catch (error) {
    console.log(error.message)
    
  }
}

const updateCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const category = req.body;
    console.log(id)
    const existingCategory = await categoryModel.findOne({ name: category.categoryName });

    if (!existingCategory||existingCategory._id.toString() === id) {
      await categoryModel.findByIdAndUpdate(id, {
        name: category.categoryName,
        description: category.description,
      });

      req.flash("message", "Category updated successfully");
      res.redirect("/admin/category");
    } else {
      req.flash("message", "Category with the same name already exists");
      res.redirect(`/admin/editCategory?id=${id}`);
    }
  } catch (error) {
    console.error("Error updating category:", error.message);
    req.flash("message", "Error updating category");
    res.redirect("/admin/category");
  }
};
const categoryAddPage = async(req,res)=>{
  try {
    const message = req.flash("message")
    res.render("addcategory",{message:message})
         
  } catch (error) {
     console.log(error.message)
  }
}

const addToCategory = async(req,res)=>{
  try {
    console.log("now at add to category")
      const name = req.body.categoryName;
      const description = req.body.description
      console.log(name+" "+description)

       const categoryExist = await categoryModel.findOne({name:name})
       console.log("////"+categoryExist+"//////")
       if (!categoryExist) {
            const categoryadded = {
              name:name,
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
    console.log(error.message)
  }
}



const unlistorlist = async (req, res) => {
  try {
      console.log("req for list or unlist");
      const id = req.query.id;
      console.log("/////" + id);
      const category = await categoryModel.findById(id);
      console.log(category);

      if (category.islisted === true) {
          await categoryModel.findByIdAndUpdate(id, {
              islisted: false
          });
          res.json({success:true})
      }else{
        await categoryModel.findByIdAndUpdate(id, {
          islisted: true
        
      });
      res.json({success:true})
      }

      
  } catch (error) {
      console.log(error.message);
      res.json({ success: false, message: error.message }); 
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