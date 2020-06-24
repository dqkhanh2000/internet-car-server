var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});
app.get('/receive', (req, res) => {
    res.sendFile(__dirname + '/public/receive.html');
});

http.listen(80, () => {
  console.log('listening on 80');
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