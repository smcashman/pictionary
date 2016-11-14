// intialize global variables
var socket = io();
var drawTool;
var guessBox;
var randomWordIndex;
var randomword;

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
                    $("#drawOrNot").html("<p style='color: crimson'>You cannot draw. No guesser online yet.</p>");
                    // Deactivates mouse action
                    mouseDown(false);
                } else {
                    $("#drawOrNot").html("<p style='color: green'>Guesser popped up. Now you can draw!</p>");
                    // Activates mouse action
                    mouseDown(true);

                    canvas.on('mouseup', function(event) {
                        drawing = false;
                    });
                }
            });
        }
         socket.on('drawing', draw);
    socket.on('drawerWentOff', function() {
        $("#drawOrNot").html("<p style='color: crimson'>Drawer went offline, stop guessing.</p>");
        guessOrNot = false;
    });
    });

   



    var onKeyDown = function(event) {
        if (event.keyCode != 13) { // Enter
            return;
        }

        
        guess = guessBox.val();
        $('#previousGuess').append('<p>' + guess + '</p>');
        console.log(guess);
        console.log(randomword)
        if (guess === randomword) {
            $('#previousGuess').append('<p> Correct! </p>');
        } else {
            console.log('nope')
        }

        guessBox.val('');
        socket.emit('userGuess', guess);
    };

    var onGuess = function(guess) {
        $('#previousGuess').text(guess);

    }

    var guessingUser = function(secondmessage) {

    }

    var lostUser = function(disconnect) {
        $('#previousGuess').html('<p> a user has left!</p>');
    }

    socket.on('userGuess', onGuess);
    guessBox = $('#guess input');
    guessBox.on('keydown', onKeyDown);
    //socket.on('message', drawingUser);
    socket.on('secondmessage', guessingUser);
    socket.on('disconnect', lostUser);

    
};




$(document).ready(function() {
    pictionary();




});