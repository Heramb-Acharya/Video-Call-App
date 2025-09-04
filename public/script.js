
const videoGrid = document.getElementById('video-grid')

const socket = io('/')
const myPeer = new Peer(undefined, {
  host: 'peerjs.com',
  secure: true,
  port: 443
});


const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream)

    myPeer.on('call', call => {
        console.log('Receiving call from:', call.peer)
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            console.log('Received stream from caller:', call.peer)
            addVideoStream(video, userVideoStream)
        })
        
        call.on('close', () => {
            console.log('Call closed from:', call.peer)
            video.remove()
        })
        
       
        peers[call.peer] = call
    })

    socket.on('user-connected', userId => {
        console.log('User connected:', userId)
        
        setTimeout(() => {
            connectToNewUser(userId, stream)
        }, 1000)
    })
})

socket.on('user-disconnected', userId => {
    console.log('User disconnected:', userId)
    if (peers[userId]) {
        peers[userId].close()
        delete peers[userId] 
    }
})

myPeer.on('open', id => {
    console.log('My peer ID:', id)
    socket.emit('join-room', ROOM_ID, id)
})


myPeer.on('error', err => {
    console.error('Peer error:', err)
})

function connectToNewUser(userId, stream) {
    console.log('Connecting to new user:', userId)
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    
    call.on('stream', userVideoStream => {
        console.log('Received stream from new user:', userId)
        addVideoStream(video, userVideoStream)
    })
    
    call.on('close', () => {
        console.log('Call closed to:', userId)
        video.remove()
    })

    call.on('error', err => {
        console.error('Call error with user', userId, ':', err)
    })

    peers[userId] = call
}

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}
