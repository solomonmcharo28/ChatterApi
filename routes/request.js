const express = require('express')
const router = new express('Router')
const Request = require('../models/request.js')
const User = require('../models/user.js')
const auth = require('../middleware/auth.js')


router.get('/requests', auth, async (req,res)=>{
     
    try{
        const reqs = await req.user.populate('sentrequests');
        console.log(reqs)
       res.send(reqs.sentrequests)
    } catch(e){
       res.status(500).send()
    }
  })

  router.get('/myrequests', auth, async (req,res)=>{
    const match = {
    }
    const sort = {

    }
    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try{
        
       const reqs = await req.user.populate('requests');
        
       res.send(reqs.requests)
    } catch(e){
       res.status(500).send(e)
    }
  })

router.get('/requests/:id', auth, async (req,res) =>{
    const _id = req.params.id
    try{
       const task = await Request.findOne({_id, owner: req.user._id})
      if(!task){
        return res.status(404).send()
    }
    res.send(task)
    } catch(e){
        res.status(500).send()
    }     
  
  })



  router.patch(('/requests'), auth, async (req, res) => {
    const updates = Object.keys(req.body)
    console.log(req.body);
    console.log(req.user);
    const allowedUpdates = ["cells", "winner", "score", "completed"]
    const isValidOperation = updates.every((update)=>{
        return allowedUpdates.includes(update)
    })
    
    if(!isValidOperation){
        return res.status(400).send({error: "Invalid Updates"})
    }
    
    try{
        const Request = await Request.findOne({owner: req.user._id})
        updates.forEach((update)=>{
            Request[update] = req.body[update]
        })
        await Request.save()
    //   const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
      res.send({Request})
    
    } catch(e){
       res.status(400).send(e)
    }
    
    })

router.delete(('/requests/:id'), auth, async (req,res) =>{
try{
    const task = await Request.findOneAndDelete({_id:req.params.id , owner: req.user._id})
    if(!task){
        res.status(404).send("Task not Found")
    }
    res.status(200).send(task)
} catch(e){

    res.status(500).send("Task not Found")
}

})

router.post('/requests', auth, async (req, res) =>{
    // const task = new Task(req.body)
    const task = new Request({
         ...req.body,
         sender: req.user._id,

    })
    try{
        await task.save()
        res.status(201).send(task)
    } catch(e) {
        res.status(400).send(e)
    }
   })
   
   router.post('/therequests', async (req, res) =>{
    // const task = new Task(req.body)
    const task = new Request({
         ...req.body,

    })
    try{
        await task.save()
        res.status(201).send(task)
    } catch(e) {
        res.status(400).send(e)
    }
   })

router.post('/requests/findRequestId', auth, async (req,res) =>{
    const description = req.body.description
    try{
       const task = await Request.findOne({description, owner: req.user._id})
      if(!task){
        return res.status(404).send("Task Not Found")
    }
    res.send(task._id)
    } catch(e){
        res.status(500).send()
    }     
  
})

module.exports = router