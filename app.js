/* This file will direct a user to a particular page according to the action of the user.
    Pages available are: home, login, register, secrets and submit.
    It also provides the logic that allows :
    - the security authentication that allows only logged in user to view the secrets & submit pages
    - encrypt the password that user provides when register to this website
    - store the encryption key to the environment variables
    - CRUD manipulation to the database that keeps a list of secrets submitted by users
*/
require("dotenv").config();// using the dotenv for storing environment variables, esp. the encryption key
const express= require("express");
const app=express();//using express
const bodyParser=require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));// system can now read values inside text boxes posted by forms
app.set('view engine', 'ejs'); // system can now read ejs files stored insie 'views'
app.use(express.static("public"));// system can now read css or js files stored inside 'public'

const encrypt=require("mongoose-encryption");// using mongoose encryption

/* Connects to Database*/
const mongoose =require("mongoose");
const strUrl="mongodb://127.0.0.1:27017/secretsDB";
mongoose.connect(strUrl, {useNewURLParser:true, useUnifiedTopology: true });
console.log("##### Successfully Connected to secretsDB");
    //codes for colelction (table): secrets
    const secretSchema=new mongoose.Schema({ // schema of the collection, what fields it should have
        secret: String
    });
    const secretModel= mongoose.model("secret", secretSchema); //use collection: secrets, create one if there is none
    //codes for colelction (table): Users
    const userSchema=new mongoose.Schema({ // schema of the collection, what fields it should have
        email: String,
        password:String
    });

    // specify encryption key
    const encryptionKey="specifyYourLongStringHere"; 
    // apply encryption to user schema using the encryptionKey above
    //, and ecprypts password field only
    userSchema.plugin(encrypt, {secret:encryptionKey, encryptedFields: ['password']});
    //use collection: users, create one if there is none
    const userModel= mongoose.model("user", userSchema); 

/*The codes below direct to home page on address: localhost:3000
*/
app.get("/", function(req,res){
    res.render("home");
});

/*The codes below direct to login page on address: localhost:3000/login
*/
app.get("/login", function(req,res){
    res.render("login");
});

/*The codes below direct to register page on address: localhost:3000/register
*/
app.get("/register", function(req,res){
    res.render("register");
});

/*The codes below specify what to do when user access: localhost:3000/register using POST method
*/
app.post("/register", async function (req,res){
    var strEmail=req.body.username; // getting the value sent by the form especially text: username
    var strPassword=req.body.password;// getting the value sent by the form especially text: password
    var userNew=new userModel({ //create a new document (object)
        email:strEmail,
        password:strPassword
    });
    try{
        await userNew.save();//save the document (object)
        console.log("##### Successfully added a new user =" + userNew.email +" pass: " +userNew.password);
        res.render("secrets");
    }catch (err){
        console.log("##### Error when registering error= " + err);
    }
});

/*The codes below specify what to do when user access: localhost:3000/login using POST method
*/
app.post("/login", async function(req,res){
    var strEmail=req.body.username; // getting the value sent by the form especially text: username
    var strPassword=req.body.password;// getting the value sent by the form especially text: password
    try{
        var userFound=await userModel.findOne({email:strEmail});//find the user wit that password
        if (userFound !=null){
            if (userFound.password== strPassword){
                console.log("#####Login successful!");
                res.render("secrets");
            }
        }else{
            console.log("#####Login failed. No matching username and password");
            res.render("login");
        }
    }catch(err){
        console.log("##### Error when logging in = " + err);
    }
});

/* Lets the server listen to port 3000 on local host */
app.listen(3000);