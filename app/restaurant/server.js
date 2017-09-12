var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var index = require('./routes/index');
var info = require('./routes/info');
var result = require('./routes/result');
var viewsPath = __dirname + '/views/';
var app = express();

const hostname = '127.0.0.1';
const port = 3000;

// EJS View engine setup, which will look into the folder "views"
app.set('view engine', 'ejs');

// Client side body and cookie parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Libraries link (used for web page aesthetics)
app.use('/vendor', express.static(__dirname + '/vendor')); // redirect to Vendor's libraries folder
app.use('/css', express.static(__dirname + '/css')); // redirect to my custom css folder
app.use('/js', express.static(__dirname + '/js')); // redirect to my custom js folder

// Web page routing
app.use('/result',result); // Direct to routes/result.js
app.use('/info', info); // Direct to routes/info.js
app.use('/',index); // Direct to routes/index.js
app.use('*',function(req,res){ // Otherwise return 404 page
    res.sendFile(viewsPath + "404.html");
});

// Listening at port 127.0.0.1:3000
app.listen(port, function () {
    console.log(`Express app listening at http://${hostname}:${port}/`);
});

/////////////////////////////////////////
// const express = require('express');
// const myrouter = require('./my-router');
//
// app.use('*',function(req,res){
//     res.
//     res.sendFile(viewsPath + "404.html");
//     res.send({ temp:"sdsd"});
//
// });
//
//// app.use('/dogssss', myrouter);
//
//
//
// // in another file (my-router.js)
// const router = express.Router();
//
// // gets hist by /users
// router get('/', function(){
//
// });
//
// router get('/dogs', function(){
//
// });
