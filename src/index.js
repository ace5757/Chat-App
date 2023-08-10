const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = 3002

const dirPath = path.join(__dirname, '../public')

app.use(express.static(dirPath))

io.on('connection', (socket)=>{
    console.log('New socket connection')
    
    socket.on('join', ({username, room}, callback)=>{
        const {error, user} = addUser({id: socket.id, username, room})

        if(error){
            return callback(error)
        }

        socket.join(user.room)
        socket.emit('message', generateMessage('Admin', "Welcome!"))
        socket.broadcast.to(user.room).emit('message', generateMessage(user.username, `${user.username} has joined`))
        
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })
    
    socket.on('sendMessage', (msg, callback)=>{
        const user = getUser(socket.id)

        const filter = new Filter()
        if(filter.isProfane(msg)){
            return callback('Profanity not allowed')
        }

        io.to(user.room).emit('message', generateMessage(user.username, msg))
        callback()
    })

    socket.on('sendLocation', (coords, callback)=>{
        const user = getUser(socket.id)

        const msg = `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`
        io.to(user.room).emit('urlLocation', generateLocationMessage(user.username, msg))
        callback()
    })

    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', generateMessage(user.username, `${user.username} left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
    
})

server.listen(port, ()=>{
    console.log("App on port "+ port)
})


// app.get('/', (req, res)=>{
//     res.send("chat app")
// })

//let count = 0

//      socket.emit('countUpdated', count)

// socket.on('increment', ()=>{
//     count++
//     //socket.emit('countUpdated', count)
//     io.emit('countUpdated', count)
// }) 