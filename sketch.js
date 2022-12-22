let imageWidth = 640;
let imageHeight = 480;
let globalColor = 255;
let frame = 0;
let scroll = 0;

let drawTrench;
let lasers;

function setup () {
  createCanvas(imageWidth, imageHeight);
  globalColor = color(255, 255);
  drawTrench = trench();
  lasers = new Lasers();
  stroke(globalColor);
}

function draw () {
  frame = floor(millis() / 50);
  background(0);
  // trench();
  drawTrench(scroll);
  translate(width / 2, height / 2);
  ship();
  translate(width * -0.4, height * -0.4);
  saucer(frame);
  translate(width * 0.25, 0);
  scale(2);
  saucer(frame);
  translate(width * 0.25, 0);
  scale(2);
  saucer(frame);
  lasers.draw();
}

function ship () {
  let noseLength = 12;
  let tailLength = 10;
  let singleWingSpan = 5;
  line(noseLength, 0, -tailLength, singleWingSpan);
  line(-tailLength, singleWingSpan, -5, 0);
  line(-5, 0, -tailLength, -singleWingSpan);
  line(-tailLength, -singleWingSpan, noseLength, 0);
}

function saucer (frame) {
  let sw = 11;
  let sh = 3;
  let bevel = 5;
  line(-sw, sh, sw, sh);
  line(sw, sh, sw + bevel, 0);
  line(sw + bevel, 0, sw, -sh);
  line(-sw, -sh, sw, -sh);
  line(-sw, -sh, -sw - bevel, 0);
  line(-sw - bevel, 0, -sw, sh);
  // hat
  let hh = 3;
  let hw = 5;
  let hbevel = 2;
  line(-hw, -sh, -hw + hbevel, -sh - hh);
  line(-hw + hbevel, -sh - hh, hw - hbevel, -sh - hh);
  line(hw - hbevel, -sh - hh, hw, -sh);

  if (frame !== undefined) {
    // three lights that move across the ship
    let fcount = 25;
    let fspace = 2;
    let centColor = 'red';
    let altColor = 'blue';

    let f1 = (frame) % (fcount + 1);
    let lx1 = map(f1, 0, fcount, -sw, sw);
    stroke(altColor);
    line(lx1, -sh + 2, lx1, sh - 2);
    // the second light should be mapped from f but a fspace frames ahead
    let f2 = (frame + fspace) % (fcount + 1);
    let lx2 = map(f2, 0, fcount, -sw, sw);
    stroke(centColor);
    line(lx2, -sh + 2, lx2, sh - 2);
    // third light is the same as the second but is ahead fspace more frames
    let f3 = (frame + fspace + fspace) % (fcount + 1);
    let lx3 = map(f3, 0, fcount, -sw, sw);
    stroke(altColor);
    line(lx3, -sh + 2, lx3, sh - 2);

    stroke(globalColor);
  }
}

// This is a class function so multiple functions can share local variables.
// It should be called ONCE. It returns a function to draw the desired trench.
// The function it returns may be called repeatedly in draw().
function trench () {
  let groundWidth = 600;
  let trenchWidth = 50;
  let trenchDepth = 50;
  let trenchBevel = 15;
  // single horizontal element of a trench
  let trenchRib = (dx = 0, dy = 0) => {
    line(-groundWidth, 0, -trenchWidth, 0);
    line(-trenchWidth, 0, -trenchWidth + trenchBevel, trenchDepth);
    line(-trenchWidth + trenchBevel, trenchDepth, trenchWidth - trenchBevel, trenchDepth);
    line(trenchWidth - trenchBevel, trenchDepth, trenchWidth, 0);
    line(trenchWidth, 0, groundWidth, 0);
  };

  let trenchSegment = (count, dx, dy) => {
    for (let i = 0; i < count; i++) {
      // connecting lines from the previous rib
      line(-trenchWidth, 0, -trenchWidth + dx, 0 + dy);
      line(-trenchWidth + trenchBevel, trenchDepth, -trenchWidth + trenchBevel + dx, trenchDepth + dy);
      line(trenchWidth - trenchBevel, trenchDepth, trenchWidth - trenchBevel + dx, trenchDepth + dy);
      line(trenchWidth, 0, trenchWidth + dx, 0 + dy);
      // now move to the current rib
      translate(dx, dy);
      trenchRib();
    }
  };

  // hand-crafted trench shape
  let trench1 = () => {
    push();
    resetMatrix();
    translate(width / 2.5, height);
    let yoff = -8;
    trenchSegment(5, 12, yoff);
    trenchSegment(3, 9, yoff);
    trenchSegment(3, 4, yoff);
    trenchSegment(2, 0, yoff);
    trenchSegment(2, -5, yoff);
    trenchSegment(2, -7, yoff);
    trenchSegment(2, -10, yoff);
    trenchSegment(2, -13, yoff);
    trenchSegment(2, -16, yoff);
    trenchSegment(2, -15, yoff);
    trenchSegment(2, -10, yoff);
    trenchSegment(3, 0, yoff);
    trenchSegment(3, 10, yoff);
    trenchSegment(2, 12, yoff);
    pop();
  };

  // dynamic trench that's a sine wave and can be scrolled
  let sinTrench = (offset) => {
    push();
    resetMatrix();
    translate(width / 2, height);
    let yoff = -8;
    let ribCount = (height * 0.75) / abs(yoff);
    for (let i = 0; i < ribCount; i++) {
      let slide = sin((i + offset) / 5) * 20;
      trenchSegment(1, slide, yoff);
    }
    pop();
  };

  return sinTrench;
  // return trench1;
}

class Lasers {
  constructor () {
    this.nw = createVector(0, 0);
    this.target = createVector(width / 2, height / 2);
    this.distance = p5.Vector.dist(this.nw, this.target);
    this.isShooting = false;
    this.travelFrames = 30;
    this.beamLength = createVector(0, 60);
    this.beamLength.setHeading(this.target.heading());
  }

  shoot (x, y) {
    if (this.isShooting === false) {
      this.isShooting = true;
      this.progress = 0;
      if (x !== undefined && y !== undefined) {
        this.target = createVector(x, y);
      }
    }
  }

  draw () {
    if (this.isShooting !== true) { return; }

    push();
    resetMatrix();

    stroke(color(102, 255, 102));

    let beam = createVector(0, this.distance * this.progress);
    beam.setHeading(this.target.heading());
    // to make the beam get smaller as it travels use curBeamLength
    let curBeamLength = this.beamLength.copy();
    curBeamLength.setMag(this.beamLength.mag() * (1 - Math.log(this.progress + 1)));
    let end = p5.Vector.add(beam, curBeamLength);
    line(beam.x, beam.y, end.x, end.y);
    print(this.progress);
    this.progress += 1 / this.travelFrames;
    if (this.progress > 0.95) {
      this.isShooting = false;
    }
    stroke(globalColor);
    pop();
  }
}

// used to scroll the trench background when using sinTrench
function mouseWheel (event) {
  scroll += event.deltaY / 4;
}

// used to fire lasers
function mousePressed (event) {
  lasers.shoot(mouseX, mouseY);
}
