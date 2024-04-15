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

    // const overlappingTiles = this.getOverlappingTiles(
    //   tiled.collidable,
    //   nextX,
    //   nextY
    // );

    let closest = 0;
    let indexClosestTile = false;
    tiled.collidable.forEach((tile, index) => {
      const collision = this.checkCollisionAABBNew(
        this.x,
        this.y,
        this.width,
        this.height,
        tile.x,
        tile.y,
        tile.width,
        tile.height
      );

      // oblicz najbliższy

      if (collision.side) {
        if (
          Math.abs(collision.centerToCenterX) +
            Math.abs(collision.centerToCenterY) <
            closest ||
          closest === 0
        ) {
          closest =
            Math.abs(collision.centerToCenterX) +
            Math.abs(collision.centerToCenterY);
          indexClosestTile = index;
        }

        collision.side ? console.log(collision.side) : "";
      }
    });

    if (indexClosestTile) {
      const collision = this.checkCollisionAABBNew(
        nextX,
        nextY,
        this.width,
        this.height,
        tiled.collidable[indexClosestTile].x,
        tiled.collidable[indexClosestTile].y,
        tiled.collidable[indexClosestTile].width,
        tiled.collidable[indexClosestTile].height,
        true
      );

      if (collision.side === "bottom") {
        normVel.y = 0;
        this.y = tiled.collidable[indexClosestTile].y - this.height;
      }
      if (collision.side === "top") {
        normVel.y = 0;
        this.y =
          tiled.collidable[indexClosestTile].y +
          tiled.collidable[indexClosestTile].height;
      }
      if (collision.side === "left") {
        normVel.x = 0;
        this.x =
          tiled.collidable[indexClosestTile].x +
          tiled.collidable[indexClosestTile].width;
      }
      if (collision.side === "right") {
        normVel.x = 0;
        this.x = tiled.collidable[indexClosestTile].x - this.width;
      }
    }

    console.log(normVel.x, normVel.y);

    // if (tiled.isInside(nextX, nextY, this.width, this.height)) {
    // if (overlappingTiles.length === 0) {
    //   // if not collide
    //   if (tiled.highlight.length !== 0) tiled.highlightTiles([]);
    //   // dodaj ttymczasowy wektor do vel
    //   this.vel.add(normVel);
    // } else {
    //   // if collide
    //   // show tiles you collide with
    //   tiled.highlightTiles(overlappingTiles);
    //   // block only x or only y velocity
    //   overlappingTiles.forEach((tile) => {
    //     // const side = this.checkCollision2Rect(tile, this);
    //     // console.log(side);
    //     // if (side === "top" || side === "bottom") {
    //     //   normVel.y = 0;
    //     // }
    //     // if (side === "left" || side === "right") {
    //     //   normVel.x = 0;
    //     // }
    //     // const points = this.checkCollisionAABBNew(
    //     //   tile.x,
    //     //   tile.y,
    //     //   tile.width,
    //     //   tile.height
    //     // );
    //     // drawLineOnMap(
    //     //   points.myPoint1.x,
    //     //   points.myPoint1.y,
    //     //   points.myPoint2.x,
    //     //   points.myPoint2.y,
    //     //   game.ctx,
    //     //   game.camera,
    //     //   "blue",
    //     //   2
    //     // );
    //     // drawLineOnMap(
    //     //   points.rectPoint1.x,
    //     //   points.rectPoint1.y,
    //     //   points.rectPoint2.x,
    //     //   points.rectPoint2.y,
    //     //   game.ctx,
    //     //   game.camera,
    //     //   "blue",
    //     //   2
    //     // );
    //   });
    //   this.vel.add(normVel);
    // }
    // }
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
