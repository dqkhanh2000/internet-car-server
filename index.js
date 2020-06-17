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

    socket.on('message', function(message) {
        socket.broadcast.emit('message', message);
        log('Client said: ', message);
        console.log("message " + socket.id + "-" + message)
    });

    socket.on("create", function(data) {
        mangRom.push({ 'room': data, 'us': [socket.id] })
        console.log(mangRom);
        for (let index = 0; index < mangRom.length; index++) {
            if (data == mangRom[index].room) {
                log('Room ' + mangRom[index].room + ' now has ' + mangRom[index].us.length + ' client(s)')
            }

        }
        socket.emit('created', data, socket.id);

    })

    socket.on("join", function(data) {
        log('Client ID ' + socket.id + ' joined room ' + data);
        // io.sockets.in(room).emit('join', room);
        // socket.join(room);
        // socket.emit('joined', room, socket.id);
        socket.broadcast.emit("join", data)
        var i;
        for (let index = 0; index < mangRom.length; index++) {
            //const element = mangRom[index];
            if (mangRom[index].room == data) {
                mangRom[index].us.push(socket.id);
                i = index;
            }
        }
        for (let index = 0; index < mangRom[i].us.length; index++) {
            socket.to(mangRom[i].us[index]).emit('ready');
        }
        socket.emit('joined', data, socket.id);
        console.log(mangRom);
    })

    socket.on('create or join', function(room) {
        console.log("rom: " + room)
        log('Received request to create or join room ' + room);

        var numClients = mangUser.length;
        log('Room ' + room + ' now has ' + numClients + ' client(s)');
        console.log('Room ' + room + ' now has ' + numClients + ' client(s)');

        if (numClients === 1) {
            socket.join(room);
            log('Client ID ' + socket.id + ' created room ' + room);
            console.log('Client ID ' + socket.id + ' created room ' + room);
            socket.emit('created', room, socket.id);

        } else if (numClients === 2) {
            log('Client ID ' + socket.id + ' joined room ' + room);
            io.sockets.in(room).emit('join', room);
            socket.join(room);
            socket.emit('joined', room, socket.id);
            io.sockets.in(room).emit('ready');
        } else { // max 5 clients
            socket.emit('full', room);
        }
    });

    socket.on('ipaddr', function() {
        log('Client said: ipaddr');
        var ifaces = os.networkInterfaces();
        for (var dev in ifaces) {
            ifaces[dev].forEach(function(details) {
                if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
                    socket.emit('ipaddr', details.address);
                }
            });
        }
    });

    socket.on("disconnect", function() {
        if (mangRom.length != 0) {
            for (let index = 0; index < mangUser.length; index++) {
                if (mangUser[index] == socket.id) {
                    mangUser.splice(index, 1);
                }

            }
            for (let index = 0; index < mangRom.length; index++) {
                for (let j = 0; j < mangRom[index].us.length; j++) {

                    if (mangRom[index].us[j] == socket.id) {
                        mangRom[index].us.splice(j, 1);
                    }
                }


            }
            for (let index = 0; index < mangRom.length; index++) {
                if (mangRom[index].us.length == 0) {
                    mangRom.splice(index, 1);
                }

            }
        }
        console.log(mangRom)
    })

    socket.on('bye', function() {
        console.log('received bye');
    });

    function log() {
        var array = ['Message from server:'];
        array.push.apply(array, arguments);
        socket.emit('log', array);
    }
});