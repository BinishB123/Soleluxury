const express = require("express")
const path = require("path")
require("dotenv").config()
const app = express()
const session = require("express-session")
const mongoose = require("mongoose")
const bodyParser = require('body-parser');
const flash=require("express-flash");
const noCache = require("nocache")
const methodOverride = require("method-override")//in form used by input fields
 
   

 mongoose.connect(process.env.dbId)
 const useFeatRoute = require("./router.js/userFeat")
 const adminRoute = require("./router.js/adminRoute")

 app.use(bodyParser.json());
 app.use(express.urlencoded({extended:true}))
 app.use('/public',express.static(path.join(__dirname,"public")))
 app.set("view engine",'ejs')
 app.set("views",[path.join(__dirname,'views/user') ,  path.join(__dirname,'views/admin')])
 app.use(session({
    secret:"y1r13t1t3rt77t7g8y3e67",
    resave:false,
    saveUninitialized:true
 }))

 app.use(methodOverride("_method"))
 //Flash middleware
 app.use(flash());
 app.use((req,res,next)=>{
  res.locals.message=req.session.message;
  delete req.session.message; 
  next(); 
 });
 app.use(noCache());

 

 app.use('/',useFeatRoute)
 app.use('/admin',adminRoute)
 app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
 
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};


  res.status(err.status || 500);
  res.render("error", { layout: false });
});


  
  const port = 3009;

app.listen(port, () => {
  console.log(`http://localhost:${port}`,`http://localhost:${port}/admin`);   
});
