const express = require('express')
const router = new express('Router')
const Board = require('../models/messageboard.js')
const User = require('../models/user.js')
const auth = require('../middleware/auth.js')

//GET /tasks?completed=false
//GET /tasks?limit=10&skip=0
//GET /tasks?sortBy=createdAt:
router.get('/boards', auth,  async (req,res)=>{
     
    try{
        const boards = await Board.find({completed: true})
        console.log(boards)
       res.send(boards)
    } catch(e){
       res.status(500).send()
    }
  })

  router.get('/myboards', auth, async (req,res)=>{
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
       const req1  = await req.user.populate('boards1');
       const req2 = await req.user.populate('boards2');
       const msgBoards = []
       for(var i =0; i<req1.boards1.length; i++){
           msgBoards.push(req1.boards1[i]);
       }
       for(var i =0; i<req2.boards2.length; i++){
        msgBoards.push(req2.boards2[i]);
    }

       res.send(msgBoards)
    } catch(e){
       res.status(500).send()
    }
  })

router.get('/boards/:id', auth, async (req,res) =>{
    const name = req.params.id
    try{
       const task = await Board.findOne({name})
      if(!task){
        return res.status(404).send()
    }
    res.send(task)
    } catch(e){
        res.status(500).send()
    }     
  
  })



  router.patch(('/boards/:id'), auth, async (req, res) => {
    const updates = Object.keys(req.body)
    console.log(req.body);
    console.log(req.user);
    const allowedUpdates = ["messages"]
    const isValidOperation = updates.every((update)=>{
        return allowedUpdates.includes(update)
    })
    
    if(!isValidOperation){
        return res.status(400).send({error: "Invalid Updates"})
    }
    
    try{
        const board = await Board.findOne({name: req.params.id})
        updates.forEach((update)=>{
            board[update] = req.body[update]
        })
        await board.save()
    //   const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
      res.send({board})
    
    } catch(e){
       res.status(400).send(e)
    }
    
    })

router.delete(('/boards/:id'), auth, async (req,res) =>{
try{
    const task = await Board.findOneAndDelete({_id:req.params.id , owner: req.user._id})
    if(!task){
        res.status(404).send("Task not Found")
    }
    res.status(200).send(task)
} catch(e){

    res.status(500).send("Task not Found")
}

})

router.post('/boards', auth, async (req, res) =>{
    // const task = new Task(req.body)
    const task = new Board({
         ...req.body,
         owner1: req.user._id

    })
    try{
        await task.save()
        res.status(201).send(task)
    } catch(e) {
        res.status(400).send(e)
    }
   })
   
   router.post('/theboards', async (req, res) =>{
    // const task = new Task(req.body)
    const task = new Board({
         ...req.body,

    })
    try{
        await task.save()
        res.status(201).send(task)
    } catch(e) {
        res.status(400).send(e)
    }
   })

router.post('/boards/findboardId', auth, async (req,res) =>{
    const description = req.body.description
    try{
       const task = await Board.findOne({description, owner: req.user._id})
      if(!task){
        return res.status(404).send("Task Not Found")
    }
    res.send(task._id)
    } catch(e){
        res.status(500).send()
    }     
  
})

module.exports = router