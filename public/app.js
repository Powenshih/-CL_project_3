//Open and connect socket
let socket = io();
let balls = [];
let ballClear = 0;
let readytoplay = false;
let removal = false;

// glowing orb with this / pixelDensity ? by Ivy Meadows https://editor.p5js.org/ivymeadows/sketches/Hy_11EQWG

let img;

function preload() {
    img = loadImage("Treasure_and_Turmoil_2000x2500.jpg");
    // img2 = loadImage("Treasure_and_Turmoil_low.jpg");
}

//Listen for confirmation of connection
socket.on('connect', () => {
    console.log("Connected");
    socket.emit('joined')
});

window.addEventListener('load', () => {
    document.getElementById('team-play').addEventListener('click', () => {
            joinLevel('team-play');
        })
        // document.getElementById('versus-play').addEventListener('click', () => {
        //     joinLevel('versus-play');
        // })

    //when user types a new message and "sends" it
    let sendbutton = document.getElementById('send-button');
    sendbutton.addEventListener('click', () => {
        let message = document.getElementById("send-input").value;
        console.log(message);
        socket.emit('newMsg', {
            message: message
        })
    })
});

// JOIN LEVEL
function joinLevel(levelData) {
    let data = {
        level: levelData
    }
    socket.emit('joinLevel', data);
}

// SHOWING MESSAGE DATA
socket.on('levelMsg', (data) => {
    document.getElementById('level-msg').innerHTML = "";
    for (let i = 0; i < data.messages.length; i++) {
        let elt = document.createElement('p');
        elt.innerHTML = data.messages[i];
        document.getElementById('level-msg').appendChild(elt);
    }

    document.getElementById('score1').innerHTML = data.score1;
    document.getElementById('scoreNum').innerHTML = data.score2;
    document.getElementById('score3').innerHTML = data.score3;

})

socket.on('newMsg', (data) => {
    // document.getElementById('new-msg').innerHTML = "";
    let elt2 = document.createElement('p');
    elt2.innerHTML = data.message;
    document.getElementById('new-msg').appendChild(elt2);
    console.log(data);
})

// // B3 spotlight interaction
// socket.on('spotData', () => {
//     spotlight(mouseX, mouseY);

// })

// A3 once a ball got removed
socket.on('removeData', () => {
    // console.log(balls)
    for (let k = 0; k < balls.length; k++) {
        balls[k].swell();
        setTimeout(function() {
            balls[k].shrink();
        }, 500);
    }
});

function setup() {
    createCanvas(2000, 2500);
    angleMode(DEGREES);

    // SEND UPDATE GAME DATA
    socket.on('gameData', (data) => {
        console.log(data);
        removeBalls(data);
    });

    // SEND UPDATED SCORES
    socket.on('newData', (data) => {
        document.getElementById('scoreNum').innerHTML = data.scores;
    });

    // GENERATE BALLS 
    socket.on('gameStart', (data) => {
        let ballData = data.data;
        console.log(ballData);
        console.log(data);
        // new loop to circulate ballData[]
        balls = []; // go back to original state
        for (let j = 0; j < ballData.length; j++) {
            let x = ballData[j].x;
            let y = ballData[j].y;
            let r = ballData[j].r;
            let b = new Ball(x, y, r);
            balls.push(b);
        }
    });
};

// resize canvas
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function draw() {

    textSize(30);
    fill(255, 128, 82);
    noStroke();
    textAlign(CENTER, TOP);
    text("test", 1000, 200);

    background(0);

    //dots at the four corner as boundry
    fill(255, 128, 82);
    ellipse(20, 20, 20);
    ellipse(1980, 2480, 20);
    ellipse(20, 2480, 20);
    ellipse(1980, 20, 20);

    // // Glow on the background image - glow follow mouse
    spotlight(mouseX, mouseY);

    textSize(30);
    fill(255, 128, 82);
    noStroke();
    textAlign(CENTER, TOP);
    text("↓↓↓ Let's go! ↓↓↓", 1000, 5);
    textSize(15);
    textAlign(CENTER, BOTTOM);
    text("Background image by Mark Pernice for the article - Treasure and Turmoil in the Deep Sea, The New York Times. Retouched and photoshopped by Po-Wen Shih for Connections Lab class project 3, 2020 Fall.", 1000, 2485);


    // Generate balls 
    for (let ball of balls) {
        readytoplay = true;

        // Balls change brightness if mouse hovered
        if (ball.contains(mouseX, mouseY)) {
            ball.changeColor(255);
        } else {
            ball.changeColor(0);
        }

        // Balls show and move according to ball class
        ball.move();
        ball.show();

        // Conditions for starting game instruction where to find the balls
        if (readytoplay && balls.length >= 20) {
            textSize(25);
            fill(255, 128, 82);
            noStroke();
            textAlign(CENTER);
            text("Bubbles are in our way! Drag your mouse to clean the ocean", 1000, 500);
        }

        // In game remider to encourage to finish the game
        if (balls.length <= 6 && balls.length >= 3) {
            textSize(25);
            fill(255, 128, 82);
            noStroke();
            textAlign(CENTER);
            text("We are getting there, keep going!", 1000, 1500);
        }
    }

    // Finish game prompt when balls are left less than three
    if (balls.length < 3 && readytoplay) {
        textSize(50);
        fill(255, 128, 82);
        noStroke();
        textAlign(CENTER);
        text("You bring us to the deep sea!!!", 1000, 2000);
    }
};

// // Glow on the background image
function spotlight(x, y) {
    // ellipse(x,y,20,20);
    for (let r = 0; r < 300; r += 5) {
        for (let theta = 0; theta < 360; theta += 5) {
            let colour = img.get(x + r * cos(theta), y + r * sin(theta));
            let newColour = color(colour[0], colour[1], colour[2], 300 - 1.5 * r);
            fill(newColour);
            // console.log(colour);
            noStroke();
            ellipse(x + r * cos(theta), y + r * sin(theta), 15, 15);
        }
        // // B1 there will another socket emit enable spotlight interaction
        // socket.emit('spotData');
        // console.log('spotdata');
    }
}

// MOUSE DRAGGED INTERACTION
function mouseDragged() {

    for (let j = 0; j < balls.length; j++) {
        if (balls[j].contains(mouseX, mouseY)) {
            balls.splice(j, 1);
            ballLeft = balls.length;
            ballNumber = j;
            ballClear++;

            let data = {
                x: mouseX,
                y: mouseY,
                left: ballLeft,
                clear: ballClear,
                ballNo: ballNumber,
            };
            // for the two games this can be different
            socket.emit('gameData', data);

            // A1 there will another socket emit enable bubble interaction
            socket.emit('removeData');
        }
    }
};

function removeBalls(data) {
    // console.log(data);
    balls.splice(data.ballNo, 1);
    removal = true;
}

// my ball DNA(class)
class Ball {
    // constructor(x, y, r, xspeed, yspeed)
    constructor(x, y, r) {
            this.x = x;
            this.y = y;
            this.r = r;
            this.a = random(255);
            this.brightness = random(100, 200);
            this.strokeR = 255;
            this.strokeG = 255;
            this.strokeB = 255;
            this.strokeA = random(255);
            this.strokeWeight = 0;
            // this.removal = removal;
            // this.xspeed = xspeed;
            // this.yspeed = yspeed;
        }
        // mouse interactions
    swell() {
        this.a += 50;
        this.r += 11;
        this.strokeWeight += random(10);
        this.strokeR -= random(255);
        this.strokeG -= random(100);
        this.strokeB -= random(50);
        // this.stroke = color(0, 0, 255);
        // this.strokeWeight = strokeWeight(10);
    }

    shrink() {
        this.a -= 50;
        this.r -= 10;
        this.strokeWeight = 0;
        this.strokeR = 255;
        this.strokeG = 255;
        this.strokeB = 255;
        this.strokeA = random(255);
        // this.stroke = color(255);
        // this.strokeWeight = strokeWeight(1.5);
    }

    show() {
        // console.log('show balls');
        stroke(this.strokeR, this.strokeG, this.strokeB, this.strokeA);
        strokeWeight(this.strokeWeight);
        fill(this.brightness, this.a);
        ellipse(this.x * 3, this.y * 3, this.r * 3);
    }

    move() {
        this.x += random(1, -1);
        this.y += random(1, -1);
        // this.x = this.x + this.xspeed;
        // this.y = this.y + this.yspeed;
        // console.log(this.yspeed);
    }

    changeColor(bright) {
        this.brightness = bright;
    }

    contains(containedX, containedY) {
        let d = dist(containedX, containedY, this.x * 3, this.y * 3);
        if (d < this.r * 1.5) {
            // console.log("ball clicked");
            return true;
        } else {
            return false;
        }
    }
}