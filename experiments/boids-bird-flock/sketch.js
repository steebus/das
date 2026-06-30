const flock = [];

let alignSlider, cohesionSlider, separationSlider;

function setup() {
  createCanvas(640, 640);
  alignSlider = createSlider(0, 5, 1, 0.1);
  createP('Alignment');

  cohesionSlider = createSlider(0, 5, 1, 0.1);
  createP('Cohesion');

  separationSlider = createSlider(0, 5, 1, 0.1);
  createP('Separation');

  for (let i = 0; i < 100; i++) {
    flock.push(new Boid());
  }
}

function draw() {
  background(51);

  for (let boid of flock) {
    boid.edges()
    boid.flock(flock);
    boid.update();
    boid.show();
  }
}
