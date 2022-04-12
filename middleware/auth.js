const jwt = require('jsonwebtoken')
const User = require('../models/user.js')
const auth = async (req, res, next) =>{
    try{
      const token = req.header('Authorization').replace('Bearer ', '')
      const decoded = jwt.verify(token, 'thisismynewrestapp')
      const user = await User.findOne({_id: decoded._id, 'tokens.token': token}).select('-password')
      if(!user){
          throw new Error()
      }
      req.token = token
      req.user = user
      console.log(user)
      next()

    } catch(e){
        res.status(401).send({error: 'Please Authenticate'})
    }



}

module.exports = auth
