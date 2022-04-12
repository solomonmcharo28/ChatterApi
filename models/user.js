const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Board = require('./messageboard.js')
const userSchema = new mongoose.Schema({
    name:{
       type: String,
       required: true,
       trim: true,
       minlength: 3
  
    },
    username:{
        type: String,
        unique: true,
        required: true,
        trim: true,
    },
    email:{
        type: String,
        unique: true,
        required: true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error("Email is invalid")
            }
        },
        trim:true,
        lowercase:true
    },
    password:{
        type: String,
        required: true,
        minlength:7,
        validate(value) {
         if(value.toLowerCase().includes('password')){
             throw new Error("Password cannot contain 'password'")
         }
        },
        trim: true
    },
    birthDate: {
        type: Date,
        required: true,
        trim: true
    },
    online:{
        type: Boolean,
        required: true,
    },
    lastOnline:{
        type: Date,
    },
    friendList:[{
        friend:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    tokens:[{
        token:{
            type:String,
            required: true
        }
    }],

    
  }, {
      timestamps:true,
      toJSON: {virtuals: true}
  })

userSchema.virtual('boards1', {
    ref:'Boards',
    localField: '_id',
    foreignField:'owner1'
})
userSchema.virtual('boards2', {
    ref:'Boards',
    localField: '_id',
    foreignField:'owner2'
})
userSchema.virtual('requests', {
    ref:'Requests',
    localField: '_id',
    foreignField:'receiver'
})
userSchema.virtual('sentrequests', {
    ref:'Requests',
    localField: '_id',
    foreignField:'sender'
})
userSchema.methods.toJSON =  function(){
    const user = this
    userObject = user.toObject()

    return userObject
}

userSchema.methods.generateAuthToken = async function() {
   
  const user = this
  const token = jwt.sign({_id: user._id.toString()}, 'thisismynewrestapp')
  user.tokens = user.tokens.concat({token})
  await user.save()
  return token
}


userSchema.statics.findByCredentials = async (email, password) =>{
    const user = await User.findOne({email})
    if(!user){
        throw new Error({error: "Unable to Log In"})
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch){
        throw new Error({error: "Unable to Log In"})
    }
    return user
    }
//Hash the plaintext password before saving
userSchema.pre('save', async function (next){
    const user = this
    console.log('just before saving')
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
  
    next()
})
//Delete User Tasks who has deleted themselves 
userSchema.pre('remove', async function(next){
    const user = this
    await Board.deleteMany({owner: user._id})
    next()
})
const User = mongoose.model('User', userSchema)

module.exports = User