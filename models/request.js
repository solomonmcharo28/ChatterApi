const mongoose = require('mongoose')
const requestSchema = new mongoose.Schema({
   name:{
      type: String,
      required: true,
      trim: true
   },
   //To be able to set an expiry date
   sender:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
   },
   receiver:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
   }
   
 }, {
    timestamps:true
 })
const Request = mongoose.model('Requests',requestSchema)
module.exports = Request