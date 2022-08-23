let imageWidth = 640;
let imageHeight = 480;

function setup () {
  createCanvas(imageWidth, imageHeight);
  stroke(255);
  background(0);
  translate(width / 2, height / 2);
  ship();
  translate(width / -4, height / -4);
  saucer();
  translate(0, height / 4);
  scale(2);
  saucer();
  translate(0, height / 8);
  scale(2);
  saucer();
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

function saucer () {
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
}