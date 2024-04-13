import { DGame } from "./DGamev2.js";
import { Sprite, drawImagePartWithTransform } from "./DGamev3.js";
import { spriteSheetData } from "./bigSpritev7data.js";
import jsonData from "./gamev9.json" assert { type: "json" };

DGame.init("canvas", 1600, 800, 2);

const bigSpritev7 = new Image();
bigSpritev7.src = "BigSpritev7.png";

const newPlayer = new Sprite(10, 10, 16, 22, DGame.ctx);
// newPlayer.addTexture(
//   spriteSheetData.purpleKnight.idle.x,
//   spriteSheetData.purpleKnight.idle.y,
//   spriteSheetData.purpleKnight.idle.w,
//   spriteSheetData.purpleKnight.idle.h,
//   bigSpritev7
// );
newPlayer.addAnim(
  "idle",
  spriteSheetData.purpleKnight.idle.x,
  spriteSheetData.purpleKnight.idle.y,
  spriteSheetData.purpleKnight.idle.w,
  spriteSheetData.purpleKnight.idle.h,
  spriteSheetData.purpleKnight.idle.frames,
  bigSpritev7
);
newPlayer.addAnim(
  "run",
  spriteSheetData.purpleKnight.run.x,
  spriteSheetData.purpleKnight.run.y,
  spriteSheetData.purpleKnight.run.w,
  spriteSheetData.purpleKnight.run.h,
  spriteSheetData.purpleKnight.run.frames,
  bigSpritev7
);

let spriteOrc = DGame.sprite.createCircle(50, -100, 25);

const {
  x: ox,
  y: oy,
  w: ow,
  h: oh,
  frames: of,
} = spriteSheetData.orcInMask.idle;

spriteOrc = DGame.sprite.addAnim(ox, oy, ow, oh, of, bigSpritev7, spriteOrc);

// console.log("sprite Orc", spriteOrc);

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

let elfSprite = DGame.sprite.createCircle(150, 100, 8);
elfSprite = DGame.sprite.addImage(
  spriteSheetData.elfM.idle.x,
  spriteSheetData.elfM.idle.y,
  spriteSheetData.elfM.idle.w,
  spriteSheetData.elfM.idle.h,
  bigSpritev7,
  elfSprite
);
elfSprite.image.isFlipX = false;

// console.log(elfSprite);

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
    if (
      DGame.keys.key[65]
      // DGame.physics.isAABBCollision(this.position.x, this.position.y, 16,16,)
    ) {
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

// console.log("player", player);

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

  DGame.camera.set(player.position.x, player.position.y);
}

let rotate = 0;
function draw(deltaTime) {
  DGame.clearRect();

  DGame.tiled.drawLayer(
    "background",
    jsonData.layers,
    jsonData.tilesets[0],
    bigSpritev7
  );
  DGame.tiled.drawLayer(
    "walls",
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

  DGame.sprite.draw(elfSprite, deltaTime);
  DGame.tiled.drawLayer(
    "foreground",
    jsonData.layers,
    jsonData.tilesets[0],
    bigSpritev7
  );

  // test

  // newPlayer.x = rotate;
  newPlayer.draw(deltaTime, "run");
  // newPlayer.anim.rotateDeg = rotate;
  rotate++;
  if (rotate > 360) rotate = 0;

  // collision WIP
  const chunkIndex = DGame.tiled.getChunkIndex(
    player.position.x,
    player.position.y,
    2,
    jsonData
  );

  if (currentChunkIndex !== chunkIndex) {
    currentChunkIndex = chunkIndex;
    collidable.length = 0;
    addTilesToCollidable(2, currentChunkIndex);
    // console.log("collidable", collidable);
  }

  // draw collidable

  collidable.forEach((el) => DGame.draw.rect(el.x, el.y, 16, 16));
}

let currentChunkIndex = null;
let collidable = [];

function addTilesToCollidable(layerIndex, chunkIndex) {
  const originPosX = jsonData.layers[layerIndex].chunks[chunkIndex].x;
  const originPosY = jsonData.layers[layerIndex].chunks[chunkIndex].y;

  jsonData.layers[layerIndex].chunks[chunkIndex].data.forEach((el, index) => {
    if (el !== 0) {
      const pos = DGame.tiled.get2dPosFrom1dArray(index, 16);
      collidable.push({
        x: pos.x * 16 + originPosX * 16,
        y: pos.y * 16 + originPosY * 16,
      });
    }
  });
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
