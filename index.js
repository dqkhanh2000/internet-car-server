const express = require('express')
var app = require('express')();

var http = require('http').createServer(app);
var io = require('socket.io').listen(http);
app.use(express.static('public'))

app.get('/caller', (req, res) => {
    res.sendFile(__dirname + '/public/caller.html');
});
app.get('/callee', (req, res) => {
    res.sendFile(__dirname + '/public/callee.html');
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, err => {
    if (err) console.log("ERROR: "+err)
    console.log("Server running: " + PORT);
});

let users = []
function getUser(socket){
    let res = {}
    users.forEach(val => {
        if(val.name){
            if(val.socket === socket) res["user"] = val
            else res['other'] = val
        }
    })
    return res
}

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on('name', data =>{
        users.push({
            "name": data.name,
            "socket": socket
        })
        console.log(data.name)
    })
    socket.on('control', function (data) {
        socket.broadcast.emit('control', data);
        console.log(data);
    });
    socket.on('status', function (data) {
        socket.broadcast.emit('dht', data);
        console.log(data);
    });

    socket.on('rtc', (data) => {
        switch (data.type) {
            case "offer":
                console.log("Recieve offer")
                getUser(socket).other.socket.emit("rtc", { "type": "offer", "data": data.data })
                break;
    
            case "answer":
                console.log("Recieve answer")
                getUser(socket).other.socket.emit("rtc", { "type": "answer", "data": data.data })
                break;
    
            case "candidate":
                console.log("Recieve candidate")
                getUser(socket).other.socket.emit("rtc", { "type": "candidate", "data": data.data })
                break;
    
            case "leave":
                break;
    
            default:
                break;
        }
    })

});