/* This is a replacement sketch.js
 * Enable or disable it in index.html
 */

let imageWidth = 640;
let imageHeight = 480 * 2;
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
  frame = millis();
  background(0);
  mapTracer.draw();
  mapTracer.draw2d();
  // mapTracer.drawRay(mapTracer.dir, mapTracer.walls[1]);
  // mapTracer.drawRays(1, 30);
}

class Wall {
  constructor (x1, y1, x2, y2) {
    this.a = createVector(x1, y1);
    this.b = createVector(x2, y2);
  }
}
class MapTracer {
  constructor () {
    this.fov = 1;
    this.rayCount = 111;
    // map as drawn is [row][col] which means [y][x]
    this.map = [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 'S', 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]];

    this.mapWidth = 100;
    this.mapHeight = 100;

    this.walls = [
      new Wall(0, 0, this.mapWidth, 0),
      new Wall(this.mapWidth, 0, this.mapWidth, this.mapHeight),
      new Wall(this.mapWidth, this.mapHeight, 0, this.mapHeight),
      new Wall(0, this.mapHeight, 0, 0),
      // bottom-right wedge
      new Wall(this.mapWidth, 0.8 * this.mapHeight, 0.8 * this.mapWidth, this.mapHeight),
      // top-left thrust
      new Wall(0, 0.3 * this.mapHeight, 0.2 * this.mapWidth, 0.3 * this.mapHeight),
      new Wall(0.2 * this.mapWidth, 0.3 * this.mapHeight, 0.2 * this.mapWidth, 0.2 * this.mapHeight),
      new Wall(0.2 * this.mapWidth, 0.2 * this.mapHeight, 0, 0.2 * this.mapHeight)
    ];
    this.gridSize = 10;
    this.pos = createVector();
    this.pos.x = 40;
    this.pos.y = 40;
    this.dir = createVector(1, 0); // use this.dir.heading() to get heading
    // print('position:', this.pos.x, this.pos.y, this.dir.heading());
  }

  turn (direction) {
    if (direction === 'left') {
      this.dir.rotate(-QUARTER_PI / 2);
    }
    if (direction === 'right') {
      this.dir.rotate(QUARTER_PI / 2);
    }
    // print('position:', this.pos.x, this.pos.y, this.dir.heading());
  }

  move (speed = 1) {
    let tox = speed * cos(this.dir.heading());
    let toy = speed * sin(this.dir.heading());
    if (this.pos.x + tox > 0 && this.pos.y > 0 && this.pos.x < 100 && this.pos.y < 100) {
      this.pos.x += tox;
      this.pos.y += toy;
    } else {
      print('out of bounds');
    }
    // print('position:', this.pos.x, this.pos.y, this.dir.heading());
  }

  drawRay (rayAngle, wall, draw = true) {
    if (draw) {
      push();
      noFill();
      stroke(globalColor);
      strokeWeight(0.5);
      translate(1, 1);
      scale(4);
    }

    // this is some wild shit based on https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
    const x1 = wall.a.x;
    const y1 = wall.a.y;
    const x2 = wall.b.x;
    const y2 = wall.b.y;

    const x3 = this.pos.x;
    const y3 = this.pos.y;
    const x4 = this.pos.x + rayAngle.x;
    const y4 = this.pos.y + rayAngle.y;

    let intersection;

    const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (denominator === 0) {
      return; // lines never intersect. Nothing else to do!
    }

    // t is the intersection within the wall segment. 0<=t<=1 means ray intersects it
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
    // u is the intersection with the ray. 0<=u means the wall intersects this ray
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator;

    if (t >= 0 && t <= 1 && u >= 0) {
      intersection = createVector(x1 + t * (x2 - x1), y1 + t * (y2 - y1));
    }
    if (draw) {
      if (intersection) {
        stroke('green');
        line(this.pos.x, this.pos.y, intersection.x, intersection.y);
      } else {
        const fakeEnd = rayAngle.copy();
        fakeEnd.setMag(100);
        fakeEnd.add(this.pos);
        stroke('red');
        line(this.pos.x, this.pos.y, fakeEnd.x, fakeEnd.y);
      }
      pop();
    }
    return intersection;
  }

  drawRays (draw = true) {
    if (draw) {
      push();
      noFill();
      stroke(globalColor);
      strokeWeight(0.5);
      translate(1, 1);
      scale(4);
    }

    let rayAngle = this.dir.copy().rotate(-this.fov / 2);
    let raySpacing = this.fov / (this.rayCount - 1);
    let distances = [];

    for (let i = 0; i < this.rayCount; i++) {
      let intersect;
      let distance = Infinity;
      // need to find the closest intersect after checking all of the walls
      for (const wall of this.walls) {
        const inter = this.drawRay(rayAngle, wall, false);
        if (inter) {
          const d = inter.dist(this.pos);
          if (d < distance) {
            intersect = inter;
            distance = d;
          }
        }
      }
      if (intersect) {
        const a = rayAngle.angleBetween(this.dir);
        distances.push(distance * cos(a)); // projection distance. Should render without fisheye.
        if (draw) {
          stroke(80, 255, 81, 100);
          line(this.pos.x, this.pos.y, intersect.x, intersect.y);
        }
      } else {
        distances.push(false);
        if (draw) {
          const fakeEnd = rayAngle.copy();
          fakeEnd.setMag(100);
          fakeEnd.add(this.pos);
          stroke('red');
          line(this.pos.x, this.pos.y, fakeEnd.x, fakeEnd.y);
        }
      }
      rayAngle.rotate(raySpacing);
    }
    if (draw) {
      pop();
    }
    return distances;
  }

  draw2d () {
    push();
    noFill();
    stroke(globalColor);
    strokeWeight(0.5);
    translate(1, 1);
    scale(4);
    for (const wall of this.walls) {
      line(wall.a.x, wall.a.y, wall.b.x, wall.b.y);
    }
    fill('yellow');
    noStroke();
    rect(this.pos.x - 2, this.pos.y - 2, 4);
    let headingLine = createVector(10, 0);
    headingLine.setHeading(this.dir.heading());
    stroke('red');
    strokeWeight(2);
    line(this.pos.x, this.pos.y, this.pos.x + headingLine.x, this.pos.y + headingLine.y);
    pop();
  }

  draw () {
    let dists = this.drawRays(this.fov, this.rayCount);
    let w = width / this.rayCount;
    push();
    translate(0, 480);
    translate(0, 480 / 2);
    noStroke();
    for (let i = 0; i < dists.length; i++) {
      let h = map(dists[i], 0, 110, 300, 0);
      // rectangle rendering
      let fillDistance = map(dists[i], 0, 110, 0, 1);
      fillDistance = (-log(fillDistance + 1)) + 1;
      fillDistance = fillDistance * 255;
      // print(fillDistance);
      fill(fillDistance);
      rect(w * i, -h, w, h * 2);
    }
    pop();
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
  if (keyCode === DOWN_ARROW) {
    mapTracer.move(-1);
  }
}
