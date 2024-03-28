import { DGame } from "./DGamev2.js";
import { spriteSheetData } from "./bigSpritev7data.js";
import jsonData from "./gamev9.json" assert { type: "json" };

DGame.init("canvas", 1600, 800, 2);

const bigSpritev7 = new Image();
bigSpritev7.src = "./bigSpritev7.png";

const player = {
  position: DGame.vector.create(100, 100),
  // velocity is like "next step"
  velocity: DGame.vector.create(0, 0),
  acc: DGame.vector.create(0, 0),

  draw: function () {
    DGame.draw.circle(this.position.x, this.position.y, 10);

    DGame.draw.line(
      this.position.x,
      this.position.y,
      this.velocity.x + this.position.x,
      this.velocity.y + this.position.y
    );
  },

  applyForce: function (vector) {
    this.acc = DGame.vector.add(this.acc, vector);
  },

  update: function () {
    // "Motion 101"

    // const mousePos = DGame.vector.create(
    //   DGame.mouse.x + DGame.camera.x,
    //   DGame.mouse.y + DGame.camera.y
    // );
    // const vSelfToMouse = DGame.vector.sub(mousePos, this.position);
    // const unitVSelfToMouse = DGame.vector.unitVector(vSelfToMouse);
    // const slowVSelfToMouse = DGame.vector.mult(vSelfToMouse, 0.0001);

    this.velocity = DGame.vector.add(this.velocity, this.acc);
    this.position = DGame.vector.add(this.position, this.velocity);
    this.acc = DGame.vector.create(0, 0);
  },
};
console.log(player);

function egdes() {
  if (player.position.y >= 200) {
    player.position.y = 200;
    player.velocity.y *= -1;
  }
  if (player.position.x >= 400) {
    player.position.x = 400;
    player.velocity.x *= -1;
  }
  // if (player.position.y >= 200) {
  //   player.position.y = 200;
  //   player.velocity.y *= -1;
  // }
  // if (player.position.y >= 200) {
  //   player.position.y = 200;
  //   player.velocity.y *= -1;
  // }
}

function update(deltaTime) {
  player.applyForce(DGame.vector.create(0, 0.01));
  player.applyForce(DGame.vector.create(0.01, 0));
  player.update();

  DGame.camera.set(player.position.x, player.position.y);

  egdes();
}

function draw() {
  DGame.clearRect();

  DGame.draw.circle(0, 0, 40);
  DGame.draw.rect(30, 100, 20, 15);
  DGame.draw.text(100, 100, DGame.math.randomNumber(0, 99));
  DGame.draw.line(30, 40, 50, 90);

  player.draw();

  DGame.draw.image(
    spriteSheetData.elfM.idle.x,
    spriteSheetData.elfM.idle.y,
    spriteSheetData.elfM.idle.w,
    spriteSheetData.elfM.idle.h,
    0,
    0,
    spriteSheetData.elfM.idle.w,
    spriteSheetData.elfM.idle.h,
    bigSpritev7
  );

  DGame.tiled.drawChunk(
    jsonData.layers[0].chunks[0],
    jsonData.tilesets[0],
    bigSpritev7
  );
  DGame.tiled.drawChunk(
    jsonData.layers[0].chunks[1],
    jsonData.tilesets[0],
    bigSpritev7
  );
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
