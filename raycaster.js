/* This is a replacement sketch.js
 * Enable or disable it in index.html
 */

let imageWidth = 640;
let imageHeight = 480;
let globalColor = 255;
let frame = 0;
let mapTracer;

function setup () {
  createCanvas(imageWidth, imageHeight);
  globalColor = color(255, 255);
  mapTracer = new MapTracer();
  stroke(globalColor);
  background(0);
}

function draw () {
  frame = floor(millis() / 50);
  background(0);
  mapTracer.draw();
}

class MapTracer {
  constructor () {
    this.rayCount = 10;
    // map as drawn is [row][col] which means [y][x]
    this.map = [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 'S', 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]];
    this.posX = 4;
    this.posY = 4;
    this.heading = 0;
  }

  turn (direction) {
    if (direction === 'left') {
      this.heading -= QUARTER_PI / 2;
    }
    if (direction === 'right') {
      this.heading += QUARTER_PI / 2;
    }
    this.heading %= TWO_PI;
    print('position:', this.posX, this.posY, this.heading);
  }

  move () {
    let tox = round(1.1 * cos(this.heading));
    let toy = round(1.1 * sin(this.heading));
    print('cos', cos(this.heading), 'sin', sin(this.heading));
    print('moving by', tox, toy, this.heading);
    if (this.posX + tox > 0 && this.posY > 0 && this.posX < 10 && this.posY < 10) {
      this.posX += tox;
      this.posY += toy;
    } else {
      print('out of bounds');
    }
    print('position:', this.posX, this.posY, this.heading);
    this.printMap();
  }

  printMap () {
    for (let row = 0; row < 10; row++) {
      let rp = '';
      for (let col = 0; col < 10; col++) {
        if (row === this.posY && col === this.posX) {
          rp = rp + 'X ';
        } else {
          rp = rp + str(this.map[row][col]) + ' ';
        }
      }
      print(rp);
    }
  }

  findHeights () {
    let minAngle = -QUARTER_PI;
    let maxAngle = QUARTER_PI;
    let sweep = maxAngle - minAngle;
    let rayWidth = sweep / this.rayCount;
    let dists = [];
    for (let ray = 0; ray < this.rayCount; ray++) {
      let angle = minAngle + rayWidth * ray;
      angle += this.heading;
      // now we need to scan down the ray to find a wall
      let found = false;
      let d = 0;
      while (d < 999 && !found) {
        let x = floor(d * cos(angle));
        let y = floor(d * sin(angle));
        if (this.posY + y >= this.map.length || this.posX + x >= this.map[this.posY].length) {
          found = true;
          d = 0;
        } else if (this.map[this.posY + y][this.posX + x] === 1) {
          found = true;
        } else {
          d += 0.1;
        }
      }
      // found for this ray, add to the results array
      dists.push(d);
    }
    return dists;
  }

  draw () {
    let dists = this.findHeights();
    let w = width / this.rayCount;
    translate(0, height / 2);
    for (let i = 0; i < dists.length; i++) {
      let height = map(dists[i], 0, 5, 300, 0);
      line(w * i, -height, w * (i + 1), -height);
      line(w * i, height, w * (i + 1), height);

      // if (i > 0) {
      //   line(w * i, dists[i] * -100, w * i, dists[i - 1] * -100);
      //   line(w * i, dists[i] * 100, w * i, dists[i - 1] * 100);
      // }
    }
  }
}

function keyPressed () {
  if (keyCode === LEFT_ARROW) {
    mapTracer.turn('left');
  }
  if (keyCode === RIGHT_ARROW) {
    mapTracer.turn('right');
  }
  if (keyCode === UP_ARROW) {
    mapTracer.move();
  }
}
