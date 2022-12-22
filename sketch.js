function drawShape (def) {
  for (let arg of arguments) {
    print(arg);
  }
  switch (def.type) {
    case 'rect':
      rect(def.x, def.y, def.w, def.h);
      break;
  }
}

let myRect;

function setup () {
  createCanvas(640, 480);
  myRect = {
    type: 'rect',
    x: 100,
    y: 50,
    w: 100,
    h: 60
  };
  stroke(255);
  noLoop();
}

function draw () {
  background(0);
  drawShape(myRect);
  let r = [300, 80, 40, 60];
  ellipse.apply(undefined, r);
}
