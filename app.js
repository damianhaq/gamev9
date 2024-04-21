import {
  Character,
  Game,
  Sprite,
  Tiled,
  Vector,
  drawCircleOnMap,
  drawImagePartWithTransform,
  drawLineOnMap,
  isLineRectCollision,
} from "./DGamev3.js";
import { spriteSheetData } from "./bigSpritev7data.js";
import jsonData from "./gamev9.json" assert { type: "json" };

const game = new Game();
game.init("canvas", 1600, 800, 2);
game.isDebug = false;

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

const silverSword = {
  x: 0,
  y: 0,
  startLength: 10,
  myVector: new Vector(0, 0),
  swingDeg: 0,

  update: function (deltaTime) {
    const mousePos = new Vector(
      game.mouse.x + game.camera.x,
      game.mouse.y + game.camera.y
    );
    const playerCenterPos = new Vector(
      newPlayer.x + newPlayer.width / 2,
      newPlayer.y + newPlayer.height / 2
    );
    // create vector from player to mouse
    this.myVector = mousePos.sub(playerCenterPos);
    this.myVector.setMag(30);
    this.swingDeg += deltaTime / 3;
    this.myVector.setAngleDeg(this.swingDeg);

    // create startLength vector
    const startLengthVector = this.myVector.clone().setMag(this.startLength);

    // update position
    this.x = newPlayer.x + newPlayer.width / 2 + startLengthVector.x;
    this.y = newPlayer.y + newPlayer.height / 2 + startLengthVector.y;

    this.checkCollision();
  },

  checkCollision: function () {
    const collision = isLineRectCollision(
      this.x,
      this.y,
      this.myVector.x + this.x,
      this.myVector.y + this.y,
      enemy.x,
      enemy.y,
      enemy.width,
      enemy.height,
      game
    );
    collision ? console.log(collision) : "";
  },

  draw: function () {
    drawImagePartWithTransform(
      bigSpritev7,
      spriteSheetData.items.weapons.silverSword.x,
      spriteSheetData.items.weapons.silverSword.y,
      spriteSheetData.items.weapons.silverSword.w,
      spriteSheetData.items.weapons.silverSword.h,
      this.x - spriteSheetData.items.weapons.silverSword.w / 2,
      this.y - spriteSheetData.items.weapons.silverSword.h,
      spriteSheetData.items.weapons.silverSword.w,
      spriteSheetData.items.weapons.silverSword.h,
      false,
      false,
      this.myVector.getAngleDeg() + 90,
      0,
      spriteSheetData.items.weapons.silverSword.h / 2,
      game.ctx,
      game.camera.x,
      game.camera.y,
      true
    );

    // draw hitboxLine
    if (game.isDebug) {
      drawLineOnMap(
        this.x,
        this.y,
        this.myVector.x + this.x,
        this.myVector.y + this.y,
        game.ctx,
        game.camera,
        "red",
        2
      );
    }
  },
};

function update(deltaTime) {
  newPlayer.WSADMove(game);

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

  newPlayer.update();
  newPlayer.draw(deltaTime);
  silverSword.update(deltaTime);

  enemy.update();
  enemy.draw(deltaTime);

  tiled.drawLayer("foreground");
  // newPlayer.anim.idle.rotateDeg = rotate;
  rotate++;
  if (rotate > 360) rotate = 0;

  silverSword.draw();

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
