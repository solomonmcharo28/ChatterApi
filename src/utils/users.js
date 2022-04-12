const users = []

const addUser = ({id, username, room}) =>{
       // Clean the Data
       username = username.trim().toLowerCase();
       room = room.trim().toLowerCase()

       // Validate the data

       if(!username || !room){
           return {
               error: 'Username and Room are required',

           }
       }

       // Check for Existing User 

       const existingUser = users.find((user) =>{
           return user.room === room && user.username === username
       })

       // Validate Username
      if(existingUser){
            return {
                error: "Username already exists"
            }
       }
     
       // Store User
       const user = {id, username, room}
       users.push(user)
       return {
           user
       }
}
const removeUser = (id) =>{
    const index = users.findIndex((user) => user.id === id)

    if(index !== -1){
        return users.splice(index, 1)[0];
    }
}
const getUser = (id) =>{
    return users.find((user) => user.id === id)
    
}

const getUsersInRoom = (room) =>{
    const usersInRoom = users.filter((user) => {
        room = room.trim().toLowerCase();
        return user.room === room;
    })
    return usersInRoom;
}

module.exports ={
    getUser,
    getUsersInRoom,
    removeUser,
    addUser
}