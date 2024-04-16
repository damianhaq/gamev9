import { DGame } from "./DGamev2.js";
import { Game, Sprite, Tiled, Vector, drawLineOnMap } from "./DGamev3.js";
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
    let normVel = new Vector(0, 0); // tymczasowy vector
    let isMoving = false; // dla zmiany animacji

    if (game.keys.key[65]) {
      // if pressed a
      normVel.x = -1;
      this.isFlipX = true;
      isMoving = true;
    } else if (game.keys.key[68]) {
      // if pressed d
      normVel.x = 1;
      this.isFlipX = false;
      isMoving = true;
    }
    if (game.keys.key[87]) {
      // if pressed w
      normVel.y = -1;
      isMoving = true;
    } else if (game.keys.key[83]) {
      // if pressed s
      normVel.y = 1;
      isMoving = true;
    }

    normVel.normalize();

    // check if next frame position
    const nextX = this.getNextFramePos(this.x, this.y, normVel).x;
    const nextY = this.getNextFramePos(this.x, this.y, normVel).y;

    const closestTiles = {
      top: { length: 0, index: false },
      bottom: { length: 0, index: false },
      left: { length: 0, index: false },
      right: { length: 0, index: false },
    };

    // function checkTile(collision) {
    //   if (
    //     Math.abs(collision.centerToCenterX) +
    //       Math.abs(collision.centerToCenterY) <
    //       closestTiles[collision.side].length ||
    //     closestTiles[collision.side].length === 0
    //   ) {
    //     closestTiles[collision.side].length =
    //       Math.abs(collision.centerToCenterX) +
    //       Math.abs(collision.centerToCenterY);
    //     closestTiles[collision.side].index = index;
    //   }
    // }

    // sprawdź wszystkie collidable
    tiled.collidable.forEach((tile, index) => {
      const collision = this.checkCollisionAABBNew(
        nextX,
        nextY,
        this.width,
        this.height,
        tile.x,
        tile.y,
        tile.width,
        tile.height,
        false,
        1
      );

      // oblicz najbliższy tylko z kolidujących
      if (collision.side) {
        // zapisuje jeden najbliższy tile z każdej strony
        if (
          Math.abs(collision.centerToCenterX) +
            Math.abs(collision.centerToCenterY) <
            closestTiles[collision.side].length ||
          closestTiles[collision.side].length === 0
        ) {
          closestTiles[collision.side].length =
            Math.abs(collision.centerToCenterX) +
            Math.abs(collision.centerToCenterY);
          closestTiles[collision.side].index = index;
        }

        // collision.side ? console.log(collision.side) : "";
      }
    });

    // zmień closestTiles na tablice z indeksami i nazwą strony
    const closestTilesArr = Object.entries(closestTiles);
    // console.log(closestTilesArr);

    // sprawdź kolizje dla najbliższego tile z każdej strony w której aktualnie istnieje
    closestTilesArr.forEach((tile) => {
      if (tile[1].index) {
        const collision = this.checkCollisionAABBNew(
          nextX,
          nextY,
          this.width,
          this.height,
          tiled.collidable[tile[1].index].x,
          tiled.collidable[tile[1].index].y,
          tiled.collidable[tile[1].index].width,
          tiled.collidable[tile[1].index].height,
          true
        );
        if (collision.side) {
          console.log(collision);

          // zablokuj ruch
          if (collision.side === "bottom") {
            // velocity Y nie może być większe od zera
            if (normVel.y > 0) normVel.y = 0;
          }
          if (collision.side === "top") {
            // velocity Y nie można być mniejsze od zera
            if (normVel.y < 0) normVel.y = 0;
          }
          if (collision.side === "left") {
            // velocity X nie można być mniejsze od zera
            if (normVel.x < 0) normVel.x = 0;
          }
          if (collision.side === "right") {
            // velocity X nie można być wieksze od zera
            if (normVel.x > 0) normVel.x = 0;
          }
        }
      }
    });

    console.log(normVel.x, normVel.y);

    this.vel.add(normVel);

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

const newPlayer = new Player(50, 50, 16, 22, game);

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
  // game.camera.set(player.position.x, player.position.y);

  game.setCamera(newPlayer.x, newPlayer.y);
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
