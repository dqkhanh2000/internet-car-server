const socket = io()
const configuration = {
    configuration: {
        offerToReceiveAudio: false,
        offerToReceiveVideo: true
    },
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
}
const localVideo = document.getElementById("local-video")
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

$("#name").val(parseInt(Math.random()*100000))
socket.emit("name", { "name": $("#name").val() })
$("#call-button").click(()=>{
    console.log(location.hash)
    if(location.hash === "#1") {
        call()
    }
})

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
    localVideo.srcObject = localStream
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream)
    })
    let offer = await peerConnection.createOffer() 
    socket.emit("rtc", { "type": "offer", "data": offer })
    peerConnection.addEventListener('track', e => {remoteVideo.srcObject = e.streams[0]})
    peerConnection.setLocalDescription(offer)
    
    peerConnection.onicecandidate = function (event) {
        if (event.candidate) {
            socket.emit('rtc', { "type": "candidate", "data": event.candidate })
        }
    }
    
}

async function handleOffer(offer) {
    peerConnection.addEventListener('track', e => {remoteVideo.srcObject = e.streams[0]})
   
    localStream = await navigator.mediaDevices.getUserMedia(constraints)   
    localVideo.srcObject = localStream
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream)
    })

    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    let answer = await peerConnection.createAnswer()
    peerConnection.setLocalDescription(answer);
    socket.emit('rtc', { "type": "answer", "data": answer })
    
}

function handleAnswer(answer) { 
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
}

function handleCandidate(candidate) { 
    peerConnection.addIceCandidate(candidate);
 }
