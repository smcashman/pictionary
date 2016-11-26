// intialize global variables
var socket = io();
var drawTool;
var guessBox;
var randomWordIndex;
var randomword;
var guess;

// define functions that handle drawing game
var pictionary = function() {
    var canvas, context;

    var draw = function(position) {
        context.beginPath();
        context.arc(position.x, position.y,
            6, 0, 2 * Math.PI);
        context.fill();
    };

    canvas = $('canvas');
    context = canvas[0].getContext('2d');
    canvas[0].width = canvas[0].offsetWidth;
    canvas[0].height = canvas[0].offsetHeight;

    socket.on("key", function(key) {
            console.log(key);
            // Checking if drawer is online based on the key
            socket.on("check", function() {
                socket.emit("drawerOnline", key);
            });

            if (key === true) {
                var drawing = false;

                socket.emit("randomWord");
                $("#guess").remove();


                // Function that activates mousedown actions
                function mouseDown(bool) {
                    canvas.on('mousedown', function(event) {
                        drawing = bool;
                    });
                }

                socket.on("randomWord", function(word) {
                    $("#userRole").html("Word to draw: " + word);
                });


                canvas.on('mousemove', function(event) {
                    if (drawing == true) {
                        var offset = canvas.offset();
                        var position = {
                            x: event.pageX - offset.left,
                            y: event.pageY - offset.top
                        };
                        draw(position);
                        socket.emit('drawing', position);

                    }
                });

                // Keeping track of online users for the drawer
                socket.on("counter", function(counter) {
                    if (counter === 1) {
                        $("#drawOrNot").html("<p style='color: crimson'> Waiting for guesser to connect...</p>");
                        // Deactivates mouse action
                        mouseDown(false);
                    } else {
                        $("#drawOrNot").html("<p style='color: green'> New guesser online! Ready, set, draw!</p>");
                        // Activates mouse action
                        mouseDown(true);

                        canvas.on('mouseup', function(event) {
                            drawing = false;
                        });
                    }
                });
            } else {


                var guessOrNot = true;

                socket.on("checkGuess", function(user) {
                    if (username === user) {
                        $("#right").html("<p style='color: green'>Your guess was correct! <br> You are now the drawer.</p>");
                        socket.emit("guesserToDrawer");
                    }
                });

                var onKeyDown = function(event) {
                    if (guessOrNot === true) {
                        guess = guessBox.val();

                        if (event.keyCode != 13) { // Enter
                            return;
                        }
                        if (guess !== "") {
                            socket.emit("guess", guess, username);
                        }
                        guessBox.val('');
                    }
                };

                guessBox.on('keydown', onKeyDown);


                socket.on('drawing', draw);
                socket.on('drawerWentOff', function() {
                    $("#drawOrNot").html("<p style='color: crimson'>Drawer is offline, stop guessing!</p>");
                    guessOrNot = false;
                });
            };

        socket.on("correct", function(user) {
            socket.emit("switch", user);
        });


       // $('#previousGuess').append('<p>' + guess + '</p>');


        guessBox.val(''); socket.emit('userGuess', guess);
    });

    socket.on("guess", function(guessText, username) {
        var button = $("<button/>", {
            text: username + ": " + guessText,
            id: username,
            class: 'btn btn-warning animated bounceIn',
            click: function() {
                // Emitting the correct guess
                socket.emit("correctGuess", username);
                $("#right").html("<p> A player guessed correctly! A new player is now drawing. Refresh to become a guesser.");
            }
        });

        $("#text").append(button);
        $("#text").append("<br><br>");
    });

    var lostUser = function(disconnect) {
        $('#previousGuess').html('<p> a user has left!</p>');
    }

    
    guessBox = $('#guess input');

    
    socket.on('disconnect', lostUser);

    socket.on("username", function(counter) {
        username = "User_" + String(counter);
        socket.emit("usernameBack", username);
    });

};




$(document).ready(function() {
    pictionary();
});