class Boid {
  constructor() {
    this.position = createVector(random(width), random(height));
    this.velocity = p5.Vector.random2D();
    this.velocity.setMag(random(2, 4));
    this.acceleration = createVector();
    this.maxForce = 0.2;
    this.maxSpeed = 4;
  }

  // loop the sim within the canvas
  edges(){
    if (this.position.x > width){
        this.position.x = 0;
    } else if (this.position.x < 0){
        this.position.x = width;
    }
        if (this.position.y > width){
        this.position.y = 0;
    } else if (this.position.y < 0){
        this.position.y = width;
    }
  }

  align(boids) {
    let influence = 50; //how far a boid can see
    let steering = createVector();
    let total = 0;
    for (let other of boids) {
      //grab the distance of all boids
      let d = dist(
        this.position.x,
        this.position.y,
        other.position.x,
        other.position.y,
      );

      //for the close boids that arent the current one
      if (other != this && d < influence) {
        steering.add(other.velocity);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce)
    }
    return steering;
  }

  flock(boids) {
    let alignment = this.align(boids);
    this.acceleration = alignment;
  }

  update() {
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
  }

  show() {
    strokeWeight(8);
    stroke(255);
    point(this.position.x, this.position.y);
  }
}
