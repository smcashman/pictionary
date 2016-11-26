// declare global variables, require packages
var http = require('http');
var express = require('express');
var socket_io = require('socket.io');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

var canvasOn = true;
var arr = [];
var user;

//initialize counter variables
var usersCurrentlyConnected = 0;
var totalClientsConnected = 0;
var isDrawerOnline = false;

//create array of words that can be drawn
var words = [
    "dinosaur", "monkey", "banana", "person", "pen", "class", "people",
    "volcano", "water", "side", "place", "man", "explosion", "woman", "octopus", "witch",
    "vampire", "queen", "sunglasses", "plane", "train", "car", "castle", "line", "wind",
    "land", "home", "hand", "balloon", "picture", "animal", "mother", "father",
    "brother", "sister", "world", "head", "snake", "country", "penguin",
    "whale", "school", "plant", "food", "sun", "flower", "eye", "city", "tree",
    "farm", "book", "sea", "night", "day", "life", "north", "south", "east",
    "west", "child", "shark", "butterfly", "paper", "music", "river", "skyscraper",
    "foot", "giant", "stars", "science", "room", "friend", "idea", "fish",
    "mountain", "horse", "watch", "color", "face", "wood", "tornado", "bird",
    "body", "dog", "family", "scarf", "door", "poison", "winter", "ship", "fall",
    "rock", "spring", "fire", "problem", "piece", "top", "bottom", "king",
    "space"
];

//pick a random word to show drawing user



io.on('connection', function(socket) {

    usersCurrentlyConnected += 1;
    totalClientsConnected += 1;

    //emitting 
    socket.emit("username", totalClientsConnected);


    // Emiting canvas key
    io.emit("key", canvasOn);
    // Emitting counter value
    io.emit("counter", usersCurrentlyConnected);


    canvasOn = false;

    socket.on("randomWord", function() {
        randomWordIndex = Math.floor(Math.random() * (100 - 1) + 1);
        var drawingWord = words[randomWordIndex];
        socket.emit("randomWord", drawingWord)

    });
    // emitting the canvas to all users
    socket.on('drawing', function(position) {

        socket.broadcast.emit('drawing', position);

    })

    socket.on("guesserToDrawer", function() {
        socket.emit("key", true);
    });
    socket.on("guess", function(guessText, username) {
        io.emit("guess", guessText, username);
    });

    socket.on("correctGuess", function(username) {
        socket.emit("correct", username);
    });

    socket.on("usernameBack", function(username) {
        user = username;
        console.log("Username: ", user);
    });

    socket.on("switch", function(user) {
        io.emit("checkGuess", user);
    });




    //handling a user disconnecting
    socket.on("disconnect", function() {
        isDrawerOnline = false;

        arr = [];

        io.emit("check");

        usersCurrentlyConnected -= 1;

        io.emit("counter", usersCurrentlyConnected);
        if (usersCurrentlyConnected === 0) {
            canvasOn = true;
        }
    });

    // Checking if the drawer is online or not, after every received disconnection
    socket.on("drawerOnline", function(key) {
        arr.push(key);

        // When the array length matches the counter, execute the following code
        if (arr.length === usersCurrentlyConnected) {
            console.log(arr);

            // We detect if the drawer is still online or not
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] === true) {
                    isDrawerOnline = true;
                }
            };

            // If he isn't, we emit the following event
            if (isDrawerOnline === false) {
                io.emit("drawerWentOff");
            };
        };
    });
});

server.listen(process.env.PORT || 8080);