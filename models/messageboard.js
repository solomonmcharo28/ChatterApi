const mongoose = require('mongoose')
const boardSchema = new mongoose.Schema({
   name:{
      type: String,
      required: true,
      trim: true
   },
   //To be able to set an expiry date
   tokens:[{
      token:{
          type:String,
          required: true
      }
  }],
   messages:[{
       message:{
         type: new mongoose.Schema(
            {
           msg :{
              type:String,
              required: true,
           },
           sender:{
               type: mongoose.Schema.Types.ObjectId,
               required:true,
               ref: 'User'
           },
           username:{
              type:String,
              required: true,
           },
         },
         { timestamps: true}
         )
       },
      
   }],
   owner1: {
      type: mongoose.Schema.Types.ObjectId,
      required: true, 
      ref: 'User'
      
   },
   owner2:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
   },
   chatName:{
      type: String,
      trim: true,
   },
   chatName1: {
      type: String,
      trim: true,
   },
   chatName2: {
      type: String,
      trim: true
   }
 }, {
    timestamps:true
 })
const Board = mongoose.model('Boards',boardSchema)
module.exports = Board