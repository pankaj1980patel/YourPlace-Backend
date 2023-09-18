const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const fs = require('fs')
const path = require('path')


const placesRouter = require("./routes/places-routes");
const userRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");

const userName = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;


const url = `mongodb+srv://${userName}:${password}@cluster0.aethqem.mongodb.net/${dbName}?retryWrites=true&w=majority`;
const app = express();
app.use(bodyParser.json());

app.use('/uploads',express.static(path.join('uploads')))

app.use((req,res,next)=>{
  res.setHeader('Access-Control-Allow-Origin','*')
  res.setHeader('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type, Accept, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE' )
  next()
})
app.use("/api/places", placesRouter);

app.use("/api/users", userRoutes);

mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {})
  .catch((error) => {
    console.log(error);
  });

app.use((req, res, next) => {
  throw new HttpError("Could not found this route", 404);
});

app.use((error, req, res, next) => {
  if(req.file){
    fs.unlink(req.file.path,(err)=>{
        console.log(err)
    })
  }
  if (res.headerSent) {
    return next(error);
  }
  console.log("General error ==========\n"+error+"\n\n\n")
  res.status(error.code || 500);
  
  res.json({ message: error.message || "An unknown error occured" });
});

// app.use('/api/',placesRouter);

app.listen(5000);
