import { DGame } from "./DGamev2.js";
DGame.init("canvas", 1600, 800, 2);

const player = {
  position: DGame.vector.create(100, 100),
  // velocity is like "next step"
  velocity: DGame.vector.create(1, 0),
  acc: DGame.vector.create(0, 0),

  draw: function () {
    DGame.draw.circle(this.position.x, this.position.y, 10);

    // velocity
    console.log(DGame.mouse.x, DGame.mouse.y);
    // const posVel = DGame.vector.sub(this.position, this.velocity);
    DGame.draw.line(
      this.position.x,
      this.position.y,
      this.velocity.x + this.position.x,
      this.velocity.y + this.position.y
    );
  },

  update: function () {
    // "Motion 101"

    const mousePos = DGame.vector.create(
      DGame.mouse.x + DGame.camera.x,
      DGame.mouse.y + DGame.camera.y
    );
    const vSelfToMouse = DGame.vector.sub(mousePos, this.position);
    // const unitVSelfToMouse = DGame.vector.unitVector(vSelfToMouse);
    const slowVSelfToMouse = DGame.vector.mult(vSelfToMouse, 0.0001);

    this.acc = slowVSelfToMouse;
    this.velocity = DGame.vector.add(this.velocity, this.acc);
    this.position = DGame.vector.add(this.position, this.velocity);
  },
};

function update(deltaTime) {
  player.update();
  DGame.camera.set(player.position.x, player.position.y);
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
