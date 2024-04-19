

const adminIsLogin = (req,res,next)=>{
    if(req.session.admin){
        res.redirect('/admin/adminhome')
    }else{
        next();
    }
}
const  adminLogged = (req,res,next)=>{
    if (req.session.admin) {
        next()
    }else{
        res.redirect('/admin')
    }
}




const adminAuth = {
    adminIsLogin,
    adminLogged,
   
}


module.exports= adminAuth