const express = require('express')
const app = express()
const server = require('http').Server(app)

const { Server } = require('socket.io');
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const { v4: uuidV4 } = require('uuid')

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
    console.log('Socket connected:', socket.id)
    
    socket.on('join-room', (roomId, userId) => {
        console.log(`User ${userId} joining room ${roomId}`)
        socket.join(roomId)
        socket.to(roomId).emit('user-connected', userId)
        
        socket.on('disconnect', () => {
            console.log(`User ${userId} disconnected from room ${roomId}`)
            socket.to(roomId).emit('user-disconnected', userId)
        })
    })
})

// Use environment port for deployment, fallback to 3000 for local
const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})