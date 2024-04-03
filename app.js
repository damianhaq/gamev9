import { DGame } from "./DGamev2.js";
import { spriteSheetData } from "./bigSpritev7data.js";
import jsonData from "./gamev9.json" assert { type: "json" };

DGame.init("canvas", 1600, 800, 2);

const bigSpritev7 = new Image();
bigSpritev7.src = "BigSpritev7.png";

let spriteOrc = DGame.sprite.createCircle(50, -100, 25);

const {
  x: ox,
  y: oy,
  w: ow,
  h: oh,
  frames: of,
} = spriteSheetData.orcInMask.idle;

spriteOrc = DGame.sprite.addAnim(ox, oy, ow, oh, of, bigSpritev7, spriteOrc);

console.log("sprite Orc", spriteOrc);

let skeletonSprite = DGame.sprite.createRect(150, -100, 20, 20);
const {
  x: sx,
  y: sy,
  w: sw,
  h: sh,
  frames: sf,
} = spriteSheetData.skeleton.idle;
skeletonSprite = DGame.sprite.addAnim(
  sx,
  sy,
  sw,
  sh,
  sf,
  bigSpritev7,
  skeletonSprite
);

const player = {
  position: DGame.vector.create(100, 100),
  // velocity is like "next step"
  velocity: DGame.vector.create(0, 0),
  acc: DGame.vector.create(0, 0),

  draw: function (deltaTime) {
    skeletonSprite.x = this.position.x;
    skeletonSprite.y = this.position.y;

    DGame.sprite.draw(skeletonSprite, deltaTime);

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
    this.velocity = DGame.vector.create(0, 0);

    this.movement();
  },

  movement: function () {
    let vector = DGame.vector.create(0, 0);
    if (DGame.keys.key[65]) {
      vector.x = -1;
      skeletonSprite.anim.isFlipX = true;
    } else if (DGame.keys.key[68]) {
      vector.x = 1;
      skeletonSprite.anim.isFlipX = false;
    }
    if (DGame.keys.key[87]) {
      vector.y = -1;
    } else if (DGame.keys.key[83]) {
      vector.y = 1;
    }

    this.velocity = DGame.vector.add(
      this.velocity,
      DGame.vector.unitVector(vector)
    );
    // console.log(this.velocity);
  },
};
console.log("player", player);

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
  // player.applyForce(DGame.vector.create(0, 0.01));
  // player.applyForce(DGame.vector.create(0.01, 0));
  player.update();

  // DGame.camera.set(player.position.x, player.position.y);

  egdes();
}

function draw(deltaTime) {
  DGame.clearRect();

  DGame.draw.circle(0, 0, 40);
  DGame.draw.rect(30, 100, 20, 15);
  DGame.draw.text(100, 100, DGame.math.randomNumber(0, 99));
  DGame.draw.line(30, 40, 50, 90);

  DGame.tiled.drawLayer(
    "background",
    jsonData.layers,
    jsonData.tilesets[0],
    bigSpritev7
  );
  DGame.tiled.drawLayer(
    "chests",
    jsonData.layers,
    jsonData.tilesets[0],
    bigSpritev7
  );
  player.draw(deltaTime);
  // DGame.sprite.draw(testSprite1);
  // DGame.sprite.draw(testSprite2);
  DGame.sprite.draw(spriteOrc, deltaTime);
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
