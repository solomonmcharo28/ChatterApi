const express = require('express')
const router = new express('Router')
const User = require('../models/user.js')
const multer = require('multer')
const auth = require('../middleware/auth.js')
const sharp = require('sharp')
const axios = require('axios')
router.get('/test', (req, res) =>{
res.send("This is a new router")
})

const upload = multer({
    limits: {
        fileSize:1000000,
    },
    fileFilter(req, file,cb){
        if(!file.originalname.match(/\.(png|jpg|jpeg)$/)){
            return cb(new Error('Please Upload a PNG, JPG or JPEG'))
        }
        cb(undefined, true)
    },

})

router.post('/users', async (req, res) =>{
    const user = new User(req.body)
    try{
    await user.save()
    const token = await user.generateAuthToken()
    res.status(201).send({user, token})
    } catch(e){
        res.status(400).send(e)
   
   }
})
router.post('/users/logout', auth, async(req, res) =>{
   try{
        req.user.tokens = req.user.tokens.filter((token) =>{
            return token.token  !== req.token
        })
        await req.user.save()
        res.send("You are Logged Out")
   }catch(e){
     res.status(500).send()
   }

})

router.post('/users/logoutAll', auth, async(req, res) =>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.send("You are logged out on all devices")
    } catch(e){
        res.status(500).send()
    }
})

router.post('/users/login', async (req,res) =>{
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
        } catch(e){
        res.status(400).send(e)
        }
        

}) 
   
router.get('/users/all', async (req,res)=>{
    try{
        const users = await User.find({}).select('-password')
      
        res.send(users)
    } catch(e){
        res.status(500).send()
    }
})
router.get('/users/me',auth, async (req,res)=>{
    res.send(req.user)
})

router.post('/users/me/avatar',auth, upload.single('avatar'), async (req, res)=>{
    const buffer = await sharp(req.file.buffer).png().resize({width:250, height:250}).toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.status(200).send("Succes! Image Uploaded")
},(error, req, res, next) =>{
    res.status(400).send({error: error.message})
})
router.delete('/users/me/avatar', auth, async(req,res) =>{
   req.user.avatar = undefined
   await req.user.save()
   res.status(200).send("Profile was deleted")

})
router.get('/users/:id/avatar', async(req,res) =>{
try{
const user = await User.findById(req.params.id)
 if(!user || !user.avatar){
     throw new Error("No image found")
 }
  res.set('Content-Type','image/png')
  res.send(user.avatar)
} catch(e){
    res.status(400).send()
}
})
router.patch('/users/me', auth, async (req, res) => {
const updates = Object.keys(req.body)
const allowedUpdates = ['name', 'email', 'password', 'username', 'birthDate', 'friendList', 'online']
const isValidOperation = updates.every((update)=>{
    return allowedUpdates.includes(update)
})

if(!isValidOperation){
    return res.status(400).send({error: "Invalid Updates"})
}

try{
    const user = req.user
    updates.forEach((update)=>{
        user[update] = req.body[update]
    })
    await user.save()
//   const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
  res.send({user})

} catch(e){
   res.status(400).send(e)
}

})
router.patch('/users/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'username', 'birthDate', 'friendList', 'online']
    const isValidOperation = updates.every((update)=>{
        return allowedUpdates.includes(update)
    })
    
    if(!isValidOperation){
        return res.status(400).send({error: "Invalid Updates"})
    }
    
    try{
        _id = req.params.id
        const user = await User.findOne({_id})
        updates.forEach((update)=>{
            user[update] = req.body[update]
        })
        await user.save()
    //   const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
      res.send({user})
    
    } catch(e){
       res.status(400).send(e)
    }
    
    })
router.get('/users/:id',  async (req,res) =>{
  const _id = req.params.id
  try{
     const user = await User.findOne({_id}).select("-password")
    if(!user){
      return res.status(404).send()
  }
  res.send(user)
  } catch(e){
      res.status(500).send()
  }     

})
router.delete(('/users/me'),auth, async (req,res) =>{
    try{
    //    const user = await User.findByIdAndDelete(req.params.id)
    //    if(!user){
    //        return res.status(404).send()
    //    }
       await req.user.remove()
       res.send(req.user)
    } catch(e){
      res.status(500).send()
    }
  })
module.exports = router