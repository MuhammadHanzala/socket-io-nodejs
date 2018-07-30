var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var data = require('./data.json');

app.use(express.static(__dirname + '/node_modules'));
app.use(express.static(__dirname + '/'));
app.get('/', function (req, res, next) {
    res.sendFile(__dirname + '/index.html');
});

server.listen(4200, function () {
    console.log('listening on port', 4200);
});

var rooms = data.rooms;
var messages = [];
var id = 1;
var online = 0;
io.on('connection', function (client) {
    console.log("socket id:", client.id);
    console.log(++online, 'Clients connected...');
    client.on('join', function (data) {
        client.join(data.roomId);
        rooms.forEach(t => {
            if (t.id == data.roomId) {
                t.participants.push(data.userId);
            }
        });
        console.log(rooms, client.id);
        client.broadcast.to(data.roomId).emit("messages", data.userId + " joined");
    });

    client.on('messages', function (data) {
        var message = {
            title: data.message,
            id,
            roomId: data.roomId
        };
        id++;
        messages.push(message);
        console.log(messages);
        client.to(data.roomId).emit('broad', { ...data, id });
    });
    client.on("message", function(data){
        console.log("message", data);
        client.broadcast.emit('message', data);
    });

    client.on('disconnect', function (data) {
        console.log(--online, 'Clients connected now...');
        // client.broadcast.to(data.roomId).emit("messages", data.userId + " left");
        // client.leave(data.roomId);
        // rooms.forEach(t => {
        //     if(t.id == data.roomId){
        //         t.participants.forEach((p, i) => {
        //             if(p == data.userId){
        //                 p.splice(i, 1);
        //             }
        //         });
        //     }
        // });
    });
    // console.log(io.sockets.clients('1'));
});