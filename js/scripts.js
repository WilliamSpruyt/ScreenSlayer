var width = 1200;
var height = 800;
var xCentre = 600;
var yCentre = 375;
var xMiddle=width/2;
var yMiddle=height/2;

var colours = [
  "red",
  "yellow",
  "blue",
  "green",
  "orange",
  "purple",
  "pink",
  "brown"
];
var e = 75 / 100;
var grav = 1;

$(document).ready(function() {
  console.log("readY");
  canvas = document.getElementById("myCanvas");
  ctx = canvas.getContext("2d");
  ctx.globalAlpha = 0.5;
  
  megaball = new Ball(
    "grey",
    50,
    50,
    1,
    1,
    Math.floor(Math.random() * 20) + 5,
    0.1,
    -0.9,
    0.8,
    900
  );
  wegaball = new Ball(
    "grey",
    1100,
    100,
    -1,
    1,
    Math.floor(Math.random() * 20) + 5,
    0.1,
    -0.9,
    0.8,
    1000
  );
  segaball = new Ball("grey", 700, 700, -1, 1, 30, 0.1, -0.9, 0.8, 1100);
  balls = [megaball, segaball, wegaball];

  // Create gradient
  var grd = ctx.createRadialGradient(600, 400, 800, 400, 250, 100);
  grd.addColorStop(0, "blue");
  grd.addColorStop(1, "green");

  // Fill with gradient
  ctx.fillStyle = grd;
  ctx.fillRect(10, 10, 1180, 780);
   
});

window.onload = function() {
  function step() {
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");
    canvas.addEventListener('click', function(evt) {
      var mousePos = getMousePos(canvas, evt);
      var posArr = 'Mouse position: ' + mousePos[0] + ',' + mousePos[1];
      console.log( posArr);xMiddle=posArr[0];yMiddle=posArr[1];
    }, false);
    
    var blen = balls.length;

    var newBalls = [];
    if (blen > 100) balls = thinner(balls);
    blen = balls.length;
    for (var i = 0; i < blen; i++) {
      balls[i].display();
      balls[i].singularity(xCentre, yCentre);
      var newCentre = orbit(xMiddle, yMiddle, xCentre, yCentre, 0.1);
      xCentre = newCentre[0];
      yCentre = newCentre[1];

      if (balls[i].getLife() < 0) {
        var velList = balls[i].vecSplit(
          Math.floor(Math.random() * (2 * Math.PI))
        );

        newball = new Ball(
          colours[blen % 8],
          balls[i].xpos,
          balls[i].ypos,
          velList[0],
          velList[1],
          balls[i].rad * 0.98,
          balls[i].increment,
          balls[i].bounce,
          balls[i].e,
          500
        );
        newball2 = new Ball(
          balls[i].col,
          balls[i].xpos,
          balls[i].ypos,
          velList[2],
          velList[3],
          balls[i].rad * 1.05,
          balls[i].increment,
          balls[i].bounce,
          balls[i].e,
          1500
        );
        balls.splice(i, i + 1);
        newBalls.push(newball);
        newBalls.push(newball2);
      }
      balls = balls.concat(newBalls);
    }

    window.requestAnimationFrame(step);
  }
  window.requestAnimationFrame(step);
};

function bouncer() {
  this.xpos = this.xpos + this.velx;
  this.ypos = this.ypos + this.vely;
  this.vely = this.vely + grav;
  if (this.xpos > width) {
    this.velx = this.velx * -1;
  }
  if (this.ypos > height - this.rad) {
    this.vely *= this.bounce;
    
  }
  if (this.xpos < 0) {
    this.velx = this.velx * -1;
  }
  if (Math.abs(this.vely) < 0.000001) {
    this.vely = -3;
  }
}

function move() {
  this.xpos = this.xpos + this.velx;
  this.ypos = this.ypos + this.vely;
  if (this.xpos > width - this.rad) {
    this.velx *= -1;
  }
  if (this.ypos > height - this.rad) {
    this.vely *= -1;
  }
  if (this.xpos < 0 + this.rad) {
    this.velx *= -1;
  }
  if (this.ypos < 0 + this.rad) {
    this.vely *= -1;
  }
}

function dist(x, y, a, b) {
  return Math.sqrt((x - a) * (x - a) + (y - b) * (y - b));
}
function getLife() {
  return this.life;
}
function Ball(col, xpos, ypos, velx, vely, rad, increment, bounce, e, life) {
  this.col = col;
  this.xpos = xpos;
  this.ypos = ypos;
  this.velx = velx;
  this.vely = vely;
  this.initvelx = velx;
  this.initvely = vely;
  this.initx = xpos;
  this.inity = ypos;
  this.rad = rad;
  this.increment = increment;
  this.bounce = bounce;
  this.bouncer = bouncer;
  this.move = move;

  this.e = e;

  this.life = life;
  this.getLife = getLife;
}

Ball.prototype.singularity = function(centreX, centreY) {
  var dis = dist(width / 2, height / 2, this.xpos, this.ypos);

  var pull = 0.1 / dis;
  this.velx = this.velx + (centreX - this.xpos) * pull;
  this.vely = this.vely + (centreY - this.ypos) * pull;
  this.xpos = this.xpos + this.velx;
  this.ypos = this.ypos + this.vely;
};

Ball.prototype.display = function() {
   
  this.life -= 1;
  ctx.beginPath();
  ctx.arc(this.xpos, this.ypos, this.rad, 0, 2 * Math.PI);
  ctx.fillStyle = this.col;
  //ctx.stroke()
  ctx.fill();
};

Ball.prototype.vecSplit = function(split) {
  var x = this.velx;
  var y = this.vely;
  var mag = Math.sqrt(x * x + y * y);
  var ang = Math.atan(y / x);
  var anga = ang + split;
  var angb = ang - split;

  var xa = mag * Math.sin(anga);
  var xb = mag * Math.sin(angb);
  var ya = mag * Math.cos(anga);
  var yb = mag * Math.cos(angb);

  return [xa, ya, xb, yb];
};
function thinner(arr) {
  var answer = [];
  for (var i = 0; i < arr.length; i += 3) {
    answer.push(arr[i]);
  }
  return answer;
}
function orbit(focusX, focusY, x, y, increment) {
  var hyp = dist(focusX, focusY, x, y);
  var sine = y - focusY;
  var cosine = x - focusX;
  var addPI = cosine < 0 ? Math.PI : 0;
   
  var angle = Math.atan(sine / cosine);
  var newAngle = angle + increment + addPI;
   
  var newX = focusX + Math.cos(newAngle) * hyp;
  var newY = focusY + Math.sin(newAngle) * hyp;
  var newCoords = [newX, newY];

  

  return newCoords;
}

 
function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return [
     evt.clientX - rect.left,
    evt.clientY - rect.top]
  ;
}