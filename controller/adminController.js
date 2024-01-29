const Admin = require("../model/adminModel")



const loginload = async(req,res)=>{
      console.log("Request come to admin  login")
      if (req.session.admin) {
        res.redirect("/admin/adminhome");
      }else{
        res.render("adminlogin")
      }
}

const adminlogin =async(req,res)=>{
    try{
        console.log("admin login load",req.body.email)
        const admin = await Admin.findOne({email:req.body.email})
        
        console.log(admin)
        
        if (admin) {
            console.log(" /////")
            console.log(admin.email)
            console.log(admin.password)
            console.log('///')
            console.log( req.body.password)
           
            if(admin.password===req.body.password){
                console.log( req.body.password)
                req.session.admin = admin
                res.redirect("/admin/adminhome")
            }else{
                 res.redirect('/admin')
                 console.log("password incorrect")
            }
        }

    }catch(error){
       console.log("Error in  admin login: "+error)
       res.status(500).send("internal server error")
    }
}

const adminhome = (req,res)=>{
    if(req.session.admin){
        res.render('adminhome')
    }else{
        res.redirect('/admin');
    }
}


const logout = (req,res)=>{
    try{
        req.session.admin = null
        res.redirect('/admin')
       
    }catch(error){
      console.log(error)
    }
  }

const adminController ={
    loginload,
    adminlogin,
    adminhome,
    logout
}

module.exports = adminController