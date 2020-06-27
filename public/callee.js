const socket = io()
const configuration = {
    configuration: {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
    },
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, {
        'urls': 'turn:numb.viagenie.ca',
        'credential': 'khanh1920',
        'username': 'reycs2000@gmail.com'
    }]
}
const constraints = {
    'video': {
        "width": 640,
        "height": 480
    },
    'audio': true
}
const peerConnection = new RTCPeerConnection(configuration)
let localStream = null
let remoteStream = null
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia

socket.emit("name", { "name": "callee" })

socket.on('rtc', (data) => {
    switch (data.type) {
        case "offer":
            console.log("Recieve offer: ", data.data)
            handleOffer(data.data)
            break;

        case "answer":
            console.log("Recieve answer: ", data.data)
            handleAnswer(data.data)
            break;

        case "candidate":
            console.log("Recieve candidate: ", data.data)
            handleCandidate(data.data)
            break;

        case "leave":
            break;

        default:
            break;
    }
})

async function call(){

    localStream = await navigator.mediaDevices.getUserMedia(constraints)
    // localVideo.srcObject = localStream
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream)
    })
    let offer = await peerConnection.createOffer() 
    socket.emit("rtc", { "type": "offer", "data": offer })
    peerConnection.addEventListener('track', e => {remoteVideo.srcObject = e.streams[0]})
    peerConnection.setLocalDescription(offer)
    
}

async function handleOffer(offer) {   
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
    localStream = await navigator.mediaDevices.getUserMedia(constraints)   
    // localVideo.srcObject = localStream
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream)
    })
    
    let answer = await peerConnection.createAnswer()
    peerConnection.setLocalDescription(answer);
    socket.emit('rtc', { "type": "answer", "data": answer })
    // peerConnection.addEventListener('track', e => {remoteVideo.srcObject = e.streams[0]})
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

function handleCandidate(candidate) { 
    if(peerConnection && peerConnection.remoteDescription.type)
        if(candidate)
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
 }
