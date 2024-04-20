import { DGame } from "./DGamev2.js";
import {
  Character,
  Game,
  Sprite,
  Tiled,
  Vector,
  drawLineOnMap,
} from "./DGamev3.js";
import { spriteSheetData } from "./bigSpritev7data.js";
import jsonData from "./gamev9.json" assert { type: "json" };

const game = new Game();
game.init("canvas", 1600, 800, 2);
// game.isDebug = false;

const bigSpritev7 = new Image();
bigSpritev7.src = "BigSpritev7.png";

const tiled = new Tiled(game, jsonData, bigSpritev7);
// add layer to collidable
tiled.addLayerToCollidable("walls"); // collidable is array inside of Tiled class

const newPlayer = new Character(50, 50, 16, 22, game);

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

const enemy = new Character(150, 50, 16, 18, game);

enemy.addAnim(
  "idle",
  spriteSheetData.skeleton.idle.x,
  spriteSheetData.skeleton.idle.y,
  spriteSheetData.skeleton.idle.w,
  spriteSheetData.skeleton.idle.h,
  spriteSheetData.skeleton.idle.frames,
  bigSpritev7
);

enemy.addAnim(
  "run",
  spriteSheetData.skeleton.run.x,
  spriteSheetData.skeleton.run.y,
  spriteSheetData.skeleton.run.w,
  spriteSheetData.skeleton.run.h,
  spriteSheetData.skeleton.run.frames,
  bigSpritev7
);

newPlayer.addCollisionWithSprite(enemy);
newPlayer.addCollisionWithCollidableTiles(tiled);

enemy.addCollisionWithCollidableTiles(tiled);

function update(deltaTime) {
  // player.applyForce(DGame.vector.create(0, 0.01));
  // player.applyForce(DGame.vector.create(0.01, 0));
  // game.camera.set(player.position.x, player.position.y);

  newPlayer.WSADMove(game);

  // newPlayer.moveToClickPoint();

  // newPlayer.mouseMove();

  enemy.moveToClickPoint(game);

  game.setCamera(newPlayer.x, newPlayer.y);
  // console.log(game.mouse.isMouseDown);
}

let rotate = 0;
function draw(deltaTime) {
  game.clearRect();

  tiled.drawLayer("background");
  tiled.drawLayer("walls");
  tiled.drawLayer("chests");

  // player.draw(deltaTime);

  // test

  newPlayer.update();
  newPlayer.draw(deltaTime);

  enemy.update();
  enemy.draw(deltaTime);

  tiled.drawLayer("foreground");
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
