let planets = []
let sun
let numPlanets = 20
let G = 10
let destabilise = 0.15
let palleteColor = [[255, 0, 94], [255, 247, 0], [128, 255, 0], [0, 229, 255]]
// sound
let polySynth
let cnv
let pitches = ['G', 'D', 'G', 'C'];
let octaves = [2, 3, 4];

function setup() {
    cnv = createCanvas(windowWidth, windowHeight)
    smooth();
    sun = new Element(50, createVector(0, 0), createVector(0, 0), createVector(255, 204, 0))

    // Initialise the planets
    for (let i = 0; i < numPlanets; i++) {
        let mass = random(4, 15)
        let radius = random(sun.d, min(windowWidth / 2, windowHeight / 2))
        let angle = random(0, TWO_PI)
        let planetPos = createVector(radius * cos(angle), radius * sin(angle))

        // Find direction of orbit and set velocity
        let planetVel = planetPos.copy()
        if (random(1) < 0.1) planetVel.rotate(-HALF_PI)
        else planetVel.rotate(HALF_PI)  // Direction of orbit
        planetVel.normalize()
        planetVel.mult(sqrt((G * sun.mass) / (radius))) // Circular orbit velocity
        planetVel.mult(random(1 - destabilise, 1 + destabilise)) // create elliptical orbit

        planets.push(new Element(mass, planetPos, planetVel, createVector(palleteColor[int(random(0, 4))])))
    }
    // Sound
    polySynth = new p5.PolySynth()

}

function draw() {
    background(0, 5)
    translate(width / 2, height / 2)

    for (let i = numPlanets - 1; i >= 0; i--) {
        sun.attract(planets[i])
        planets[i].move()
        planets[i].show()
    }
    sun.show()
}

function playSynth() {
    userStartAudio();

    // note duration (in seconds)
    let dur = 2;

    // time from now (in seconds)
    let time = 0;

    // velocity (volume, from 0 to 1)
    let vel = 0.3;

    // notes can overlap with each other
    //polySynth.play('G2', vel, 0, dur);
    // polySynth.play('C3', vel, time += 1 / 3, dur);
    // polySynth.play('G3', vel, time += 1 / 3, dur);
    // polySynth.play('B4', vel, time += 1 / 4, dur);

    //polySynth.play('G2', vel, 0, dur);

    for (let i = 0; i < 4; i++) {
        let note = random(pitches) + random(octaves);
        polySynth.play(note, vel, 0, dur);
      }

}


function Element(_mass, _pos, _vel, _col) {
    this.mass = _mass
    this.pos = _pos
    this.vel = _vel
    this.c = _col
    this.d = this.mass / 2
    this.thetaInit = 0
    this.path = []
    this.pathLen = Infinity

    this.show = function () {
        stroke(3, 50)
        for (let i = 0; i < this.path.length - 2; i++) {
            line(this.path[i].x, this.path[i].y, this.path[i + 1].x, this.path[i + 1].y,)
        }

        fill(this.c.x, this.c.y, this.c.z, 40); noStroke()
        ellipse(this.pos.x, this.pos.y, this.d, this.d)

    }


    this.move = function () {
        this.pos.x += this.vel.x
        this.pos.y += this.vel.y
        this.path.push(createVector(this.pos.x, this.pos.y))
        if (this.path.length > 200) this.path.splice(0, 1)
    }

    this.applyForce = function (f) {
        this.vel.x += f.x / this.mass
        this.vel.y += f.y / this.mass
    }

    this.attract = function (child) {
        let r = dist(this.pos.x, this.pos.y, child.pos.x, child.pos.y)
        let f = (this.pos.copy()).sub(child.pos)
        f.setMag((G * (this.mass * map(mouseX, 0, width, 0.9, 1)) * child.mass) / (r * r))
        child.applyForce(f)

        if (touches.length > 0 || mouseIsPressed === true) {
            stroke(child.c.x, child.c.y, child.c.z)
            line(this.pos.x, this.pos.y, child.pos.x, child.pos.y)
            cnv.mousePressed(playSynth)
        }


    }

}