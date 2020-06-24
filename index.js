var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});
app.get('/receive', (req, res) => {
    res.sendFile(__dirname + '/public/receive.html');
});

const PORT = process.env.PORT || 80;
app.listen(PORT, err => {
    if(err) throw err;
    console.log("%c Server running:" , "color: green");
});

var mangRom = [], mangUser = [];

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('control',function(data){
        socket.broadcast.emit('control',data);
        console.log(data);
    });
    socket.on('status', function(data){
        socket.broadcast.emit('dht',data);
        console.log(data);
    });

});