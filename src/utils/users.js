const users = []

const addUser = ({id, username, room})=>{
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate data
    if(!username || !room){
        return {
            error: 'Username and room are required'
        }
    }
    //check for existing user
    const existingUser = users.find((user)=>{
        return user.username === username && user.room===room
    })
    //validate username
    if(existingUser){
        return {
            error: 'Username is in use'
        }
    }
    //adding user
    const user = {id, username, room}
    users.push(user)
    return {user}
}

const getUser = (id) =>{
    return users.find((user)=>{
        return user.id===id                   //no need to validate cause if he dont..
    })                                        //..find it return 'undefined'
}

const removeUser = (id) =>{
    const index = users.findIndex((user)=> user.id===id)
    if(index!=-1){
        return users.splice(index, 1)[0]
    }
}

const getUsersInRoom = (room) =>{
    room = room.trim().toLowerCase()
    return users.filter((user)=>user.room===room)    //return array
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}

//testing adduser
    // const a = addUser({
    //     id: 22,
    //     username: 'Ace',
    //     room: 'room1'
    // })
    // console.log(users)
    // console.log(a)

//testing remove user
    // addUser({
    //     id: 22,
    //     username: 'Ace',
    //     room: 'room1'
    // })
    // const a = removeUser(22)
    // console.log(a)
    // console.log(users)