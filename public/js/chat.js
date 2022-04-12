const socket =  io()
const $messageForm = document.getElementById("myMessage");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button")
const $locationButton = document.getElementById("sendLocation")
const $messages = document.querySelector("#messages")

//templates
const $messageTemplate = document.querySelector("#message-template").innerHTML
const $locationTemplate = document.querySelector("#location-template").innerHTML
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix : true})
socket.on('countUpdated', (count) =>{
    console.log("The count has been updated", count)
    document.getElementById("countVal").innerHTML = count
})

document.getElementById("increment").addEventListener("click", () =>{
    console.log("Clicked")
    socket.emit('increment')
})

document.getElementById("myMessage").addEventListener("submit", (e) =>{
    e.preventDefault()
    $messageFormButton.setAttribute("disabled", "disabled")
    const msg = e.target.elements.message.value
    //console.log(msg)
    socket.emit("sendMessage", msg, (error) =>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ' ';
        $messageFormInput.focus()
        if(error){
            return console.log(error)
        }
        console.log("The message was delivered")
    })
   
})

document.getElementById("sendLocation").addEventListener("click", (e) => {
    if(!navigator.geolocation){
        alert("Browser does not support Geolocation");
        return;
    }
    $locationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
      
      console.log(position)
      socket.emit("sendLocation", {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
      }, (location)=> {
        console.log(location)
        $locationButton.removeAttribute('disabled')
      })

    })
}) 
const autoscroll = () =>{
   
    const $newMessage = $messages.lastElementChild


    //Height of the Last Message 
    const newMessagesStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessagesStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    
    //Visisble Height
    const visibleHeight = $messages.offsetHeight

    //Height of Message Container
    const containerHeight = $messages.scrollHeight

    //How far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
    console.log(newMessagesStyles)
}

socket.on('message', (msg) =>{
    const message = msg.text
    console.log(message);
    const createdAt = moment(msg.createdAt).format(" h:MM A")
    const html = Mustache.render($messageTemplate, {
        username: msg.username,
        message,
        createdAt
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (location) =>{
    console.log(location);
    const html = Mustache.render($locationTemplate, {
        username: location.username,
        locationMessage: location.url,
        createdAt: moment(location.createdAt).format(" h:MM A")
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', (roomData) =>{
   const html = Mustache.render($sidebarTemplate, {
       room : roomData.room,
       users: roomData.users
   })
   document.querySelector("#sidebar").innerHTML = html
})
socket.emit('join', {username, room}, (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
})