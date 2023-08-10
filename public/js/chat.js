const socket = io()

//variables
const $msgForm = document.querySelector('#message-form')
const $msgFormInput = $msgForm.querySelector('input')
const $msgFormButton = $msgForm.querySelector('button')

const $sendLockButton = document.querySelector('#sendlocation')
const $messages = document.querySelector('#messages') // div for rendering msg

//template
const msgTemplate = document.querySelector('#msg-template').innerHTML

const LocationTemplate = document.querySelector('#loc-template').innerHTML

const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


//autoscroll
const autoscroll = ()=>{
    //new msg elemnt
    const $newMessage = $messages.lastElementChild
    //height of new msg
    const newMsgStyles = getComputedStyle($newMessage)
    const newMsgMargin = parseInt(newMsgStyles.marginBottom)
    const newMsgHeight = $newMessage.offsetHeight + newMsgMargin
    
    //visible height
    const visibleHeight = $messages.offsetHeight
    
    //height of msg container (whole chat list)
    const containerHeight = $messages.scrollHeight

    //how far we scrolled
    const scrollOfset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMsgHeight <= scrollOfset+10){
        $messages.scrollTop = containerHeight - visibleHeight
    }
}

socket.on('message', (message)=>{
    console.log(message)
    const html = Mustache.render(msgTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a'),
        username: message.username
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('urlLocation', (url)=>{
    console.log(url)
    const html = Mustache.render(LocationTemplate, {
        url: url.url,
        createdAt: moment(url.createdAt).format('h:mm a'),
        username: url.username
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({room, users})=>{
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$msgForm.addEventListener('submit', (e)=>{
    e.preventDefault()
    //const message = document.querySelector('input').value
    
    //disable button
    $msgFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error)=>{
        if(error){
            return console.log(error)
        }
        //enable
        $msgFormButton.removeAttribute('disabled')
        $msgFormInput.value = ''
        $msgFormInput.focus()

        console.log('Message delivered')
    })
})

document.querySelector('#sendlocation').addEventListener('click', ()=>{
    if(!navigator.geolocation){
        return alert('Not supported')
    }
    
    // disable
    $sendLockButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((pos)=>{
        console.log(pos)
        socket.emit('sendLocation', {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
        }, ()=>{
            //enable
            $sendLockButton.removeAttribute('disabled')

            console.log('Location delivered')
        })
    })
})

const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})
socket.emit('join', {username, room}, (error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})

// socket.on('countUpdated', (count)=>{
//     console.log(" the count has been updated ", count)
// })

// document.querySelector('#increment').addEventListener('click', ()=>{
//     console.log('clicked')
//     socket.emit('increment')
// })