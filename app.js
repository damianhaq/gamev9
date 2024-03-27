import { DGame } from "./DGamev2.js";
DGame.init("canvas", 1600, 800, 2);

const player = {
  position: DGame.vector.create(100, 100),
  // velocity is like "next step"
  velocity: DGame.vector.create(1, 0),
  acc: DGame.vector.create(0, 0),

  textPos: DGame.vector.create(0, 0),
  pointPos: DGame.vector.create(0, 0),

  draw: function () {
    DGame.draw.circle(this.position.x, this.position.y, 10);
    DGame.draw.line(
      this.position.x,
      this.position.y,
      this.acc.x + this.pointPos.x,
      this.acc.y + this.pointPos.y
    );
    DGame.draw.text(
      this.textPos.x + this.position.x,
      this.textPos.y + this.position.y,
      DGame.vector.mag(this.acc)
    );
  },

  update: function () {
    const mouse = DGame.vector.create(DGame.mouse.x, DGame.mouse.y);
    this.pointPos = DGame.vector.create(0, 30);

    // get vector from player to mouse
    const playerPointVector = DGame.vector.sub(this.pointPos, this.position);

    // console.log(DGame.vector.mag(playerPointVector));
    this.textPos = DGame.vector.mult(playerPointVector, 0.5);
    // console.log(this.position.x);

    // make a unit vector
    // const unitAcc = DGame.vector.unitVector(this.acc);

    // slow down a little
    this.acc = DGame.vector.mult(playerPointVector, 0.0005);
    this.velocity = DGame.vector.add(this.velocity, this.acc);
    this.position = DGame.vector.add(this.position, this.velocity);
  },
};

function update(deltaTime) {
  player.update();
  // DGame.camera.set(player.position.x, player.position.y);
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
