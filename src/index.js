const express = require('express');
const path = require('path')
const http = require('http')
const axios = require('axios')
const socketio = require('socket.io')
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const Filter = require('bad-words')
require('../db/mongoose')
var cors = require('cors')
const { generateMessage, generateLocationMessage } = require("./utils/messages")
const app = express();
const server = http.createServer(app)
const io = socketio(server, {
    cors: {
      origin: "http://localhost:3000"
    }
  })
const {addUser, removeUser, getUser, getUsersInRoom} = require("./utils/users")
const port = process.env.PORT || "3001"
const publicDirectoryPath = path.join(__dirname, "../public")
var usersRouter = require('../routes/users');
var requestsRouter = require('../routes/request');
var boardsRouter = require('../routes/board')
app.use(express.static(publicDirectoryPath))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors())
app.use(usersRouter)
app.use(requestsRouter)
app.use(boardsRouter)
let count = 0

io.on('connection', (socket) =>{
    console.log("New WebSocket Connection")
    let token = null;
    socket.on('token', (options, callback) => {
        console.log(options)
        token = options.token
        let config = {
            headers: {
            Authorization: options.token,
            }
        }
        let data = {
            online: true,
        }
        axios.patch('http://localhost:3001/users/me',data ,  config)
                .then((response) =>{
                })
                .catch(function (error) {
                console.log(error.message);
                
                });
    })
    
    //socket.emit('countUpdated', count)
    

    socket.on('join', (options, callback) => {
        const {error, user} = addUser({id: socket.id, ...options})
        console.log(options)
        if(error){
            return callback(error)
        }
        socket.join(user.room)
        
        //socket.emit('message', generateMessage("Admin","Welcome!"))
        socket.broadcast.to(user.room).emit("message", generateMessage("Chatter", `${user.username} is in the chat`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })
    socket.on('increment', () =>{
        count++;
        //socket.emit('countUpdated', count)
        io.emit('countUpdated', count)
    })
    socket.on('sendMessage', (msg, callback)=>{
        const user = getUser(socket.id);
        if(user){
         const filter = new Filter()
         if(filter.isProfane(msg)){
            return callback("Profanity is not allowed")
         }
         io.to(user.room).emit('message', generateMessage(user.username, msg.msg))
         callback('Delivered!')
         let config = {
            headers: {
            Authorization: token,
            }
        }
        
         axios.get('http://localhost:3001/boards/' + user.room, config)
         .then((response) =>{
             const messages = response.data.messages;
              const  messager = {
                    sender: msg.sender,
                    msg: msg.msg,
                    username: user.username
                }
             
             messages.push({message: messager})
             const data = {
                 messages
             }
             axios.patch('http://localhost:3001/boards/' + user.room, data,  config)
                .then((response) =>{
                })
                .catch(function (error) {
                console.log(error.message);
                
                });

         })
         .catch(function (error) {
         console.log(error.message);
         
         });

        }


    })
    socket.on("disconnect", ()=>{
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message', generateMessage("Chatter", `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
        let config = {
            headers: {
            Authorization: token,
            }
        }
        let data = {
            online: false,
        }
        axios.patch('http://localhost:3001/users/me', data , config)
                .then((response) =>{
                })
                .catch(function (error) {
                console.log(error.message);
                
                });
      
    })
    socket.on("sendLocation", (pos, callback)=>{
        const user = getUser(socket.id)
        if(user){
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${pos.latitude},${pos.longitude}`))
        callback("Location Shared")
        }
        
    })
})
server.listen(port, ()=> {
    console.log("Server is on port " + port);
})
