let imageWidth = 640;
let imageHeight = 480;
let globalColor = 255;
let frame = 0;

function setup () {
  createCanvas(imageWidth, imageHeight);
  stroke(globalColor);
}

function draw () {
  frame = floor(millis() / 50);
  background(0);
  translate(width / 2, height / 2);
  ship();
  translate(width / -4, height / -4);
  saucer(frame);
  translate(0, height / 4);
  scale(2);
  saucer(frame + 15);
  translate(0, height / 8);
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
