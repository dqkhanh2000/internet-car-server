const socket = io()
let isFirst = true
const configuration = {
    configuration: {
        offerToReceiveAudio: false,
        offerToReceiveVideo: true
    },
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:global.stun.twilio.com:3478?transport=udp' }]
}
const remoteVideo = document.getElementById("remote-video")
const constraints = {
    'video': {
        "width": 640,
        "height": 480
    },
    'audio': false
}
const peerConnection = new RTCPeerConnection(configuration)
let localStream = null
let remoteStream = null
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia

socket.emit("name", { "name": "caller" })

socket.on('rtc', (data) => {
    switch (data.type) {
        case "answer":
            console.log("Recieve answer: ", data.data)
            handleAnswer(data.data)
            break;

       case "leave":
            break;

        default:
            break;
    }
})

async function call(){

    localStream = await navigator.mediaDevices.getUserMedia(constraints)
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream)
    })
    let offer = await peerConnection.createOffer() 
    socket.emit("rtc", { "type": "offer", "data": offer })
    peerConnection.addEventListener('track', e => {
        remoteVideo.srcObject = e.streams[0]
        remoteStream = e.streams[0]
    })
    peerConnection.setLocalDescription(offer)
    
}


function handleAnswer(answer) { 
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
    peerConnection.onicecandidate = function (event) {
        if (event.candidate) {
            socket.emit('rtc', { "type": "candidate", "data": event.candidate })
        }
    }
    if(isFirst){
        call()
        isFirst = false
    }
}

call()
