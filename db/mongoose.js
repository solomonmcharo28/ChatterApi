const mongoose = require('mongoose')
const  mongoAtlasUri =
        "mongodb+srv://myserviceApp:myserviceApp@cluster0.ncpjw.mongodb.net/ChatterApp?retryWrites=true&w=majority";
try {
    // Connect to the MongoDB cluster
     mongoose.connect(
      mongoAtlasUri,
      { useNewUrlParser: true, useUnifiedTopology: true },
      () => console.log(" Mongoose is connected")
    );

  } catch (e) {
    console.log("could not connect");
  }
// const { MongoClient } = require('mongodb');
// const uri = "mongodb://127.0.0.1:27017/huduma-chap-api";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// client.connect(err => {
 
// });
//mongodb+srv://myserviceApp:<password>@cluster0.ncpjw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
// mongodb+srv://mytaskApp:mytaskApp@cluster0.lthrf.mongodb.net/test?retryWrites=true&w=majority
// const me = new User({
//     name: "   Paul   ",
//     email: "pogba@email.com",
//     password: "mypass123"
// me.save().then(() => {
// console.log(me)
// }).catch((error) =>{
//    console.log('Error!', error)
// })


// const jobApp = new Task({
//     description:" Apply to Jobs",
//     completed: false
// })

// jobApp.save().then(() => {
//     console.log(jobApp)
//     }).catch((error) =>{
//        console.log('Error!', error)
//     })