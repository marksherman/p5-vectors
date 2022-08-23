let imageWidth = 640;
let imageHeight = 480;
let globalColor = 255;
let frame = 0;
let scroll = 0;

let drawTrench = trench();

function setup () {
  createCanvas(imageWidth, imageHeight);
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
      line(trenchWidth - trenchBevel, trenchDepth, trenchWidth - trenchBevel + dx, trenchDepth + dy)
      line(trenchWidth, 0, trenchWidth + dx, 0 + dy);
      // now move to the current rib
      translate(dx, dy);
      trenchRib();
    }
  };

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

function mouseWheel (event) {
  scroll += event.deltaY / 4;
}
