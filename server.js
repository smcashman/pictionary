var http = require('http');
var express = require('express');
var socket_io = require('socket.io');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

var clientsConnected = 0

io.on('connection', function (socket) {
	//io.emit('message', 'A new user has joined!');
	clientsConnected ++
	console.log(clientsConnected+' before if')
	if (clientsConnected < 2){
		console.log(clientsConnected)
		io.emit('message', 'You are drawing!'); 	
	}
	else {
		io.emit('secondMessage', 'You are guessing!');
	}

	socket.on('drawing', function(position){
// 		if (clientsConnected < 2){
 	socket.broadcast.emit('drawing', position);
// };
	})

socket.on('userGuess', function(guess){
	socket.broadcast.emit('userGuess', guess);
});

socket.on('disconnect', function() {
        io.emit('disconnect', 'A user has left');
    });
});

server.listen(process.env.PORT || 8080);
