
var socket = io();
var drawTool;
var guessBox;
var randomWordIndex;
var randomword;

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

     
    canvas.on('mousedown', function(event){
            drawTool = true;
            console.log(drawTool)
        })

    canvas.on('mouseup', function(event){
        drawTool = false;
        console.log(drawTool)
         })

 canvas.on('mousemove', function(event) {
        if (drawTool){
        var offset = canvas.offset();
        var position = {x: event.pageX - offset.left,
                        y: event.pageY - offset.top};
        draw(position);
        socket.emit('drawing', position);
    };
         });

 socket.on('drawing', draw);


var drawingUser = function(message){
    $('#guess').hide();
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

 randomWordIndex = Math.floor(Math.random()*(100-1)+1);
 randomword = words[randomWordIndex];

$('#userRole').html('<p>'+randomword+'</p>');
};


 var onKeyDown = function(event) {
    if (event.keyCode != 13) { // Enter
        return;
    }

    console.log(guessBox.val());
    guess=guessBox.val();
    $('#previousGuess').append('<p>'+guess+'</p>');
    if (guess == randomword){
        $('#previousGuess').append('<p> Correct! </p>');
    }
    else {
        console.log('nope')
    }

    guessBox.val('');
    socket.emit('userGuess', guess);
};

var onGuess = function(guess){
    $('#previousGuess').text(guess);
    
}

var guessingUser = function(secondmessage){

}

var lostUser = function(disconnect){
    $('#previousGuess').append('<p> a user has left!</p>');
}

socket.on('userGuess', onGuess);
guessBox = $('#guess input');
guessBox.on('keydown', onKeyDown);
socket.on('message', drawingUser);
socket.on('secondmessage', guessingUser);
socket.on('disconnect', lostUser);

// var addGuess = function(guessBox){
//     $('#previousGuess').append('<p>'+guessBox+'</p>');
// }
};




$(document).ready(function() {
pictionary();




});
