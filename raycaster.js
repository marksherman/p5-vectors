/* This is a replacement sketch.js
 * Enable or disable it in index.html
 */

let imageWidth = 640;
let imageHeight = 480;
let globalColor = 255;
let frame = 0;
let mapTracer;

function setup () {
  createCanvas(imageWidth, imageHeight * 2);
  globalColor = color(255, 255);
  mapTracer = new MapTracer();
  stroke(globalColor);
  background(0);
  noLoop();
}

function draw () {
  frame = millis();
  background(0);
  // mapTracer.drawVertex(mapTracer.walls[4].a);
  // mapTracer.drawWall(mapTracer.walls[0]);
  // mapTracer.draw();
  mapTracer.draw2d();
  // mapTracer.drawRay(mapTracer.dir);
  mapTracer.drawRays();
}

class Wall {
  constructor (id, x1, y1, x2, y2) {
    this.id = id;
    this.a = createVector(x1, y1);
    this.b = createVector(x2, y2);
  }
}
class MapTracer {
  constructor () {
    this.fov = 2;
    this.rayCount = 30;
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
      new Wall(0, 0, 0, this.mapWidth, 0),
      new Wall(1, this.mapWidth, 0, this.mapWidth, this.mapHeight),
      // new Wall(2, this.mapWidth, this.mapHeight, 0, this.mapHeight),
      new Wall(3, 0, this.mapHeight, 0, 0),
      // bottom-right wedge
      new Wall(4, this.mapWidth, 0.8 * this.mapHeight, 0.8 * this.mapWidth, this.mapHeight),
      // top-left thrust
      new Wall(5, 0, 0.3 * this.mapHeight, 0.2 * this.mapWidth, 0.3 * this.mapHeight),
      new Wall(6, 0.2 * this.mapWidth, 0.3 * this.mapHeight, 0.2 * this.mapWidth, 0.2 * this.mapHeight),
      new Wall(7, 0.2 * this.mapWidth, 0.2 * this.mapHeight, 0, 0.2 * this.mapHeight)
    ];
    this.gridSize = 10;
    this.pos = createVector();
    this.pos.x = 40;
    this.pos.y = 40;
    this.dir = createVector(1, 0); // use this.dir.heading() to get heading
  }

  turn (direction) {
    if (direction === 'left') {
      this.dir.rotate(-QUARTER_PI / 4);
    }
    if (direction === 'right') {
      this.dir.rotate(QUARTER_PI / 4);
    }
    // print('position:', this.pos.x, this.pos.y, this.dir.heading());
    redraw();
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
    redraw();
  }

  drawVertex (v) {
    push();
    // translate(0, 480);
    // translate(imageWidth / 2, 480 / 2);
    translate(1, 1);
    scale(4);

    const c = this.pos; // "camera," our position
    const h = this.dir;
    const fovLim = this.fov / 2;
    const t0 = p5.Vector.fromAngle(atan((v.y - c.y) / (v.x - c.x))); // theta_origin: angle to vertex from pos based on origin plane (heading 0)
    let tA; // theta_apparent: angle betweeen heading and vertex
    tA = h.angleBetween(t0);

    const leftLim = h.copy().rotate(-fovLim).heading();
    const rightLim = h.copy().rotate(fovLim).heading();

    // print('θ_0', t0.heading(), 'θ_A', tA,
    //   `${t0.heading() < leftLim ? '<' : ''}[${leftLim}..${h.heading()}..${rightLim}]${t0.heading() > rightLim ? '>' : ''}`);
    // if (t0.heading() < leftLim || t0.heading() > rightLim) {
    //   // vertex is outside our FoV, do not draw
    //   pop();
    //   return;
    // }

    stroke('blue');
    line(v.x, v.y, c.x, c.y);

    scale(1 / 4);
    translate(-1, 480 - 1);
    translate(imageWidth / 2, 480 / 2);
    const di = sqrt((v.x - c.x) ** 2 + (v.y - c.y) ** 2); // distance to intersection of heading and origin plain of the vertex
    const w = di * tan(tA); // width: horiz dist of vertex from center of screen; percieved dist from heading
    const d = v.dist(c);
    const dh = map(d, 0, 140, imageHeight / 2, 5); // distance->draw height
    const scaledw = map(w, -110, 110, -imageWidth / 2, imageWidth / 2);
    fill('blue');
    stroke(globalColor);
    line(scaledw, -dh, scaledw, dh);
    ellipse(scaledw, -dh, 5);
    ellipse(scaledw, dh, 5);
    pop();
    return [scaledw, -dh, scaledw, dh];
  }

  drawWall (wallId) {
    if (wallId === undefined) {
      return;
    }
    const wall = this.walls.find((el) => el.id === wallId);
    const a = this.drawVertex(wall.a);
    const b = this.drawVertex(wall.b);

    push();
    translate(0, 480);
    translate(640 / 2, 480 / 2);
    line(a[0], a[1], b[0], b[1]);
    line(a[2], a[3], b[2], b[3]);
    pop();
  }

  drawRay (rayAngle) {
    push();
    noFill();
    stroke(globalColor);
    strokeWeight(0.5);
    translate(1, 1);
    scale(4);

    let minDistance = Infinity; // closest thing found on this particular ray
    let closestIntersection;
    let closestWallId;

    for (const wall of this.walls) {
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
      if (denominator !== 0) { // if 0, lines never intersect. nothing else to do.
        // t is the intersection within the wall segment. 0<=t<=1 means ray intersects it
        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
        // u is the intersection with the ray. 0<=u means the wall intersects this ray
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator;

        if (t >= 0 && t <= 1 && u >= 0) {
          intersection = createVector(x1 + t * (x2 - x1), y1 + t * (y2 - y1));
        }

        if (intersection && intersection.dist(this.pos) < minDistance) {
          closestIntersection = intersection;
          minDistance = intersection.dist(this.pos);
          closestWallId = wall.id;
        }
      }
    }

    if (closestIntersection) {
      stroke(80, 255, 81, 100);
      line(this.pos.x, this.pos.y, closestIntersection.x, closestIntersection.y);
    } else {
      const fakeEnd = rayAngle.copy();
      fakeEnd.setMag(100);
      fakeEnd.add(this.pos);
      stroke('red');
      line(this.pos.x, this.pos.y, fakeEnd.x, fakeEnd.y);
    }
    pop();
    return closestWallId;
  }

  drawRays () {
    const fovLim = this.fov / 2;
    let rayAngle = this.dir.copy().rotate(-fovLim);
    let raySpacing = this.fov / (this.rayCount - 1);
    let wallsHit = [];

    for (let i = 0; i < this.rayCount; i++) {
      // need to find the closest intersect after checking all of the walls
      const wallId = this.drawRay(rayAngle, true);
      if (!wallsHit.find((el) => el === wallId)) {
        wallsHit.push(wallId);
      }
      rayAngle.rotate(raySpacing);
    }

    for (const wallId of wallsHit) {
      this.drawWall(wallId);
    }
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
