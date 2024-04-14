import { DGame } from "./DGamev2.js";
import { Game, Sprite, Tiled, Vector } from "./DGamev3.js";
import { spriteSheetData } from "./bigSpritev7data.js";
import jsonData from "./gamev9.json" assert { type: "json" };

const game = new Game();
game.init("canvas", 1600, 800, 2);
// game.isDebug = false;

const bigSpritev7 = new Image();
bigSpritev7.src = "BigSpritev7.png";

const tiled = new Tiled(game, jsonData, bigSpritev7);

class Player extends Sprite {
  constructor(x, y, width, height, game) {
    super(x, y, width, height, game);

    this.x = x;
    this.y = y;
    this.vel = new Vector(0, 0);
    this.acc = new Vector(0, 0);
  }

  update() {
    let normVel = new Vector(0, 0);
    let isMoving = false;

    if (game.keys.key[65]) {
      normVel.x = -1;
      this.isFlipX = true;
      isMoving = true;
    } else if (game.keys.key[68]) {
      normVel.x = 1;
      this.isFlipX = false;
      isMoving = true;
    }
    if (game.keys.key[87]) {
      normVel.y = -1;
      isMoving = true;
    } else if (game.keys.key[83]) {
      normVel.y = 1;
      isMoving = true;
    }

    normVel.normalize();
    // check if next frame position is inside the map boundaries
    const nextX = this.getNextFramePos(this.x, this.y, normVel).x;
    const nextY = this.getNextFramePos(this.x, this.y, normVel).y;

    if (tiled.isInside(nextX, nextY, this.width, this.height)) {
      // dodaj ttymczasowy wektor do vel
      this.vel.add(normVel);
    }

    // add vel to pos
    this.x += this.vel.x;
    this.y += this.vel.y;

    // reset vel to 0 if no key is pressed
    this.vel.set(0, 0);

    this.setCurrentAnim(isMoving ? "run" : "idle");
  }

  // // calculate next frame position
  getNextFramePos(posX, posY, vel) {
    return { x: posX + vel.x, y: posY + vel.y };
  }
}

const newPlayer = new Player(10, 10, 16, 22, game);

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

function update(deltaTime) {
  // player.applyForce(DGame.vector.create(0, 0.01));
  // player.applyForce(DGame.vector.create(0.01, 0));
  newPlayer.update();
  // game.camera.set(player.position.x, player.position.y);
  game.setCamera(newPlayer.x, newPlayer.y);
}

let rotate = 0;
function draw(deltaTime) {
  game.clearRect();

  tiled.drawLayer("background");
  tiled.drawLayer("walls");
  tiled.drawLayer("chests");
  tiled.drawLayer("foreground");

  // player.draw(deltaTime);

  // test

  newPlayer.draw(deltaTime);
  // newPlayer.anim.rotateDeg = rotate;
  rotate++;
  if (rotate > 360) rotate = 0;

  // collision WIP
  // const chunkIndex = DGame.tiled.getChunkIndex(
  //   player.position.x,
  //   player.position.y,
  //   2,
  //   jsonData
  // );

  // if (currentChunkIndex !== chunkIndex) {
  //   currentChunkIndex = chunkIndex;
  //   collidable.length = 0;
  //   addTilesToCollidable(2, currentChunkIndex);
  //   // console.log("collidable", collidable);
  // }

  // draw collidable

  // collidable.forEach((el) => DGame.draw.rect(el.x, el.y, 16, 16));

  tiled.drawDebug();
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
