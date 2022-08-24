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
  // noLoop();
}

function draw () {
  frame = floor(millis() / 50);
  background(0);
  mapTracer.draw2d();
  mapTracer.drawRays();
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
    this.mapWidth = 100;
    this.mapHeight = 100;
    this.gridSize = 10;
    this.posX = 40;
    this.posY = 40;
    this.heading = 0;
    print('position:', this.posX, this.posY, this.heading);
  }

  turn (direction) {
    if (direction === 'left') {
      this.heading -= QUARTER_PI / 2;
    }
    if (direction === 'right') {
      this.heading += QUARTER_PI / 2;
    }
    this.heading %= TWO_PI;
    if (this.heading < 0) {
      this.heading = TWO_PI - abs(this.heading);
    }
    print('position:', this.posX, this.posY, this.heading);
  }

  move () {
    let tox = round(1.1 * cos(this.heading));
    let toy = round(1.1 * sin(this.heading));
    print('cos', cos(this.heading), 'sin', sin(this.heading));
    print('moving by', tox, toy, this.heading);
    if (this.posX + tox > 0 && this.posY > 0 && this.posX < 100 && this.posY < 100) {
      this.posX += tox;
      this.posY += toy;
    } else {
      print('out of bounds');
    }
    print('position:', this.posX, this.posY, this.heading);
    // redraw();
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

  drawRays () {
    push();
    noFill();
    stroke(globalColor);
    strokeWeight(0.5);
    stroke('green');
    translate(1, 1);
    scale(4);

    let rayAngle = this.heading;
    let rayY;
    let rayX;
    let offX; // offsets to go multiple grid squares quickly
    let offY;
    // **********************************************************
    // * find horizontal line intercept                         *
    // **********************************************************
    let arcTan = -1 / tan(rayAngle);
    let depth = 0; // when this hits 10 the loop below stops. Prevents infinite loop.
    // looking up
    // TODO there's a bug in here when the player is sitting exactly on a horizontal line
    if (rayAngle > PI) {
      rayY = floor(this.posY / this.gridSize) * this.gridSize;
      rayX = (this.posY - rayY) * arcTan + this.posX;
      offY = -this.gridSize;
      offX = -offY * arcTan;
    }
    // looking down
    if (rayAngle < PI) {
      rayY = floor(this.posY / this.gridSize) * this.gridSize + this.gridSize;
      rayX = (this.posY - rayY) * arcTan + this.posX;
      offY = this.gridSize;
      offX = -offY * arcTan;
    }
    // looking left or right won't ever hit a horizontal line
    // if ((rayAngle < 0.0000000000001 && rayAngle > -0.0000000000001) ||
    //     (rayAngle < PI + 0.0000000000001 && rayAngle > PI - 0.0000000000001) ||
    //     (rayAngle < TWO_PI + 0.0000000000001 && rayAngle > TWO_PI - 0.0000000000001)) {
    //   rayX = this.posX;
    //   rayY = this.posY;
    //   depth = 10; // don't do the loop
    // }
    // now we loop to find the nearest wall, one offset click at a time
    while (depth < 8) {
      const gridX = floor(rayX / this.gridSize);
      const gridY = floor(rayY / this.gridSize);
      // if our coordinates are on the map, check the map and end the loop if wall found
      if (gridX < 10 && gridY < 10 && gridX >= 0 && gridY >= 0 && 
          this.map[gridY][gridX] === 1) {
        depth = 10; // hit a wall; stop
      } else {
        rayX += offX;
        rayY += offY;
        depth += 1;
      }
    }
    if (rayY < this.posY) { rayY += this.gridSize; }
    strokeWeight(4);
    line(this.posX, this.posY, rayX, rayY);

    // **********************************************************
    // * find vertical line intercept                         *
    // **********************************************************
    let nTan = -1 * tan(rayAngle);
    depth = 0; // when this hits 10 the loop below stops. Prevents infinite loop.
    // looking left
    if (rayAngle > HALF_PI && rayAngle < 3 * HALF_PI) {
      rayX = floor(this.posX / this.gridSize) * this.gridSize;
      rayY = (this.posX - rayX) * nTan + this.posY;
      offX = -this.gridSize;
      offY = -offX * nTan;
    }
    // looking right
    if (rayAngle < HALF_PI || rayAngle > 3 * HALF_PI) {
      rayX = floor(this.posX / this.gridSize) * this.gridSize + this.gridSize;
      rayY = (this.posX - rayX) * nTan + this.posY;
      offX = this.gridSize;
      offY = -offX * nTan;
    }
    // looking up or down won't ever hit a horizontal line
    // if ((rayAngle < TWO_PI + 0.0000000000001 && rayAngle > TWO_PI - 0.0000000000001) ||
    //     (rayAngle < 3 * TWO_PI + 0.0000000000001 && rayAngle > 3 * TWO_PI - 0.0000000000001)) {
    //   rayX = this.posX;
    //   rayY = this.posY;
    //   depth = 10; // don't do the loop
    // }
    // now we loop to find the nearest wall, one offset click at a time
    while (depth < 8) {
      const gridX = floor(rayX / this.gridSize);
      const gridY = floor(rayY / this.gridSize);
      // if our coordinates are on the map, check the map and end the loop if wall found
      if (gridX < 10 && gridY < 10 && gridX >= 0 && gridY >= 0 && 
          this.map[gridY][gridX] === 1) {
        depth = 10; // hit a wall; stop
      } else {
        rayX += offX;
        rayY += offY;
        depth += 1;
      }
    }
    if (rayX < this.posX) { rayX += this.gridSize; }
    strokeWeight(0.5);
    stroke('purple');
    line(this.posX, this.posY, rayX, rayY);
    pop();
  }

  draw2d () {
    push();
    noFill();
    stroke(globalColor);
    strokeWeight(0.5);
    translate(1, 1);
    scale(4);
    let s = this.gridSize;
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        if (this.map[row][col] === 1) { fill(200); }
        else { noFill(); }
        rect(col * s, row * s, s);
      }
    }
    fill('yellow');
    noStroke();
    rect(this.posX - 2, this.posY - 2, 4);
    let headingLine = createVector(10, 0);
    headingLine.setHeading(this.heading);
    stroke('red');
    line(this.posX, this.posY, this.posX + headingLine.x, this.posY + headingLine.y);
    pop();
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
