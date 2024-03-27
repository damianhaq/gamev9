import { DGame } from "./DGamev2.js";
DGame.init("canvas", 1600, 800, 2);

const player = {
  position: DGame.vector.create(100, 100),
  // velocity is like "next step"
  velocity: DGame.vector.create(0, 0),
  acc: DGame.vector.create(0, 0),

  draw: function () {
    DGame.draw.circle(this.position.x, this.position.y, 10);
  },

  update: function () {
    const random1 = DGame.math.randomNumber(-1, 1);
    const random2 = DGame.math.randomNumber(-1, 1);

    const acc = DGame.vector.create(random1, random2);

    // low acc
    this.acc = DGame.vector.mult(acc, 0.1);
    const velocity1 = DGame.vector.add(this.velocity, this.acc);
    // max velocity = 1
    this.velocity = DGame.vector.limit(velocity1, 1);
    console.log(DGame.vector.mag(this.velocity));
    this.position = DGame.vector.add(this.position, this.velocity);
  },
};

function update(deltaTime) {
  player.update();
}

function draw() {
  DGame.clearRect();

  DGame.draw.circle(0, 0, 40);
  DGame.draw.rect(30, 100, 20, 15);
  DGame.draw.text(100, 100, DGame.math.randomNumber(0, 99));
  DGame.draw.line(30, 40, 50, 90);

  player.draw();
}

requestAnimationFrame(gameLoop);
let lastTime = 0;
function gameLoop(timestamp) {
  const deltaTime = +(timestamp - lastTime).toFixed(2);
  lastTime = timestamp;

  update(deltaTime);

  draw(deltaTime);

  requestAnimationFrame(gameLoop);
}

// acc -> vel -> pos
