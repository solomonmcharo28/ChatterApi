const generateMessage = (username, text, sender) =>{
return {
    username,
    text,
    createdAt: new Date().getTime(),
    sender
}

}

const generateLocationMessage = (username,url, sender)=>{
    return{
        username,
        url,
        createdAt: new Date().getTime(),
        sender
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}