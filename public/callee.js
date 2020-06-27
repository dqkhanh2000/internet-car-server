const socket = io()
const configuration = {
    configuration: {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
    },
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
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
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia

socket.emit("name", { "name": "callee" })

socket.on('rtc', (data) => {
    switch (data.type) {
        case "offer":
            console.log("Recieve offer: ", data.data)
            handleOffer(data.data)
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


async function handleOffer(offer) {   
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
    localStream = await navigator.mediaDevices.getUserMedia(constraints)   
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream)
    })
    
    let answer = await peerConnection.createAnswer()
    peerConnection.setLocalDescription(answer);
    socket.emit('rtc', { "type": "answer", "data": answer })
}

function handleCandidate(candidate) { 
    if(peerConnection && peerConnection.remoteDescription.type)
        if(candidate)
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
 }
