// CLASSESS

import { DGame } from "./DGamev2.js";

/*
Sprite to jest obiekt który może być interaktywny 
1. nieporuszalne / poruszalne
2. tekstura / animacja

TODO:  pos/vel/acc, addForce, kolizja
*/

export class Game {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.scaleFactor = 1;
    this.isDebug = true;

    this.mouse = {
      click: false,
      x: false,
      y: false,
    };

    this.keys = {
      key: [],
    };

    this.camera = {
      x: 0,
      y: 0,
    };
  }
  setCamera(x, y) {
    this.camera.x = x - this.canvas.width / (2 * this.scaleFactor);
    this.camera.y = y - this.canvas.height / (2 * this.scaleFactor);
  }

  init(canvasID, canvasWidth, canvasHeight, scaleFactor) {
    this.canvas = document.querySelector(`#${canvasID}`);
    this.ctx = this.canvas.getContext("2d");
    this.scaleFactor = scaleFactor;

    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;
    this.canvas.style.border = "1px solid black";
    this.canvas.setAttribute("tabindex", 0);

    this.canvas.addEventListener("mousedown", (ev) => {
      this.mouse.click = true;
    });
    this.canvas.addEventListener("mouseup", (ev) => {
      this.mouse.click = false;
    });
    this.canvas.addEventListener("mousemove", (ev) => {
      this.mouse.x = Math.round(ev.offsetX / this.scaleFactor);
      this.mouse.y = Math.round(ev.offsetY / this.scaleFactor);
    });

    this.canvas.addEventListener("keydown", (ev) => {
      if (!this.keys.key[ev.keyCode]) this.keys.key[ev.keyCode] = true;
      // console.log(ev.keyCode);
    });
    this.canvas.addEventListener("keyup", (ev) => {
      if (this.keys.key[ev.keyCode]) this.keys.key[ev.keyCode] = false;
    });

    this.ctx.scale(this.scaleFactor, this.scaleFactor);
    this.ctx.imageSmoothingEnabled = false;

    this.setCamera(0, 0);

    // console.log(this);
  }

  clearRect() {
    this.ctx.fillStyle = "#898989";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

export class Sprite {
  constructor(x, y, width, height, game) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.game = game;

    this.isFlipX = false;
    this.isFlipY = false;
    this.animName = "unset";

    this.viewType = "unset"; // unset, texture, anim
  }

  addTexture(fromX, fromY, fromWidth, fromHeight, image) {
    this.viewType = "texture";
    this.texture = {
      fromX,
      fromY,
      fromWidth,
      fromHeight,
      image,
      rotateDeg: 0,
      rotatePointX: 0,
      rotatePointY: 0,
    };

    if (fromWidth !== this.width || fromHeight !== this.height) {
      console.log(
        "Wymiary tekstury: " +
          `${fromWidth}x${fromHeight}. ` +
          "Wymiary sprita: " +
          `${this.width}x${this.height}. ` +
          "Zalecane jest zmianę wymiarów sprita na wymiary tekstury."
      );
    }
  }

  setCurrentAnim(name) {
    if (this.viewType === "anim") {
      this.anim.currFrame = 0;
      this.anim.currFrameTime = 0;
      this.animName = name;
    }
  }

  addAnim(name, fromX, fromY, fromWidth, fromHeight, frames, image) {
    this.viewType = "anim";
    if (!this.anim) {
      this.anim = {};
    }

    this.anim[name] = {
      fromX,
      fromY,
      fromWidth,
      frames,
      fromHeight,
      image,
      currFrame: 0,
      frameTime: 100,
      currFrameTime: 0,
      rotateDeg: 0,
      rotatePointX: 0,
      rotatePointY: 0,
    };
    this.setCurrentAnim(name);

    if (fromWidth !== this.width || fromHeight !== this.height) {
      console.warn(
        "Wymiary tekstury animacji: " +
          `${fromWidth}x${fromHeight}. ` +
          "Wymiary sprita: " +
          `${this.width}x${this.height}. ` +
          "Zalecane jest zmianę wymiarów sprita na wymiary tekstury animacji."
      );
    }
  }

  draw(deltaTime) {
    if (this.viewType === "texture") {
      drawImagePartWithTransform(
        this.texture.image,
        this.texture.fromX,
        this.texture.fromY,
        this.texture.fromWidth,
        this.texture.fromHeight,
        this.x - this.game.camera.x,
        this.y - this.game.camera.y,
        this.texture.fromWidth,
        this.texture.fromHeight,
        this.isFlipX,
        this.isFlipY,
        this.texture.rotateDeg,
        this.texture.rotatePointX,
        this.texture.rotatePointY,
        this.game.ctx,
        0,
        0,
        true
      );
    } else if (this.viewType === "anim") {
      // animation logic
      this.anim[this.animName].currFrameTime += deltaTime;
      if (
        this.anim[this.animName].currFrameTime >=
        this.anim[this.animName].frameTime
      ) {
        this.anim[this.animName].currFrameTime -=
          this.anim[this.animName].frameTime;
        this.anim[this.animName].currFrame =
          (this.anim[this.animName].currFrame + 1) %
          this.anim[this.animName].frames;
      }

      drawImagePartWithTransform(
        this.anim[this.animName].image,
        this.anim[this.animName].fromX +
          this.anim[this.animName].fromWidth *
            this.anim[this.animName].currFrame,
        this.anim[this.animName].fromY,
        this.anim[this.animName].fromWidth,
        this.anim[this.animName].fromHeight,
        this.x - this.game.camera.x,
        this.y - this.game.camera.y,
        this.anim[this.animName].fromWidth,
        this.anim[this.animName].fromHeight,
        this.isFlipX,
        this.isFlipY,
        this.anim[this.animName].rotateDeg,
        this.anim[this.animName].rotatePointX,
        this.anim[this.animName].rotatePointY,
        this.game.ctx,
        0,
        0,
        true
      );
    }
    // hitbox
    this.game.ctx.beginPath();
    this.game.ctx.rect(
      this.x - this.game.camera.x,
      this.y - this.game.camera.y,
      this.width,
      this.height
    );
    this.game.ctx.stroke();

    // console.log(this.x, this.y);
  }
}

export class Tiled {
  constructor(game) {
    this.game = game;
  }
  getTilePosFromSpritesheet(
    id,
    tilesetsColumns,
    tilesetsTileWidth,
    tilkesetsTileHeight
  ) {
    // TODO: dodać wyszukiwanie tileset po nazwie "name":"spritesheet",

    const row = Math.floor((id - 1) / tilesetsColumns);
    const column = id - 1 - row * tilesetsColumns;

    return { x: column * tilesetsTileWidth, y: row * tilkesetsTileHeight };
  }

  get2dPosFrom1dArray(index, columns) {
    const x = index % columns;
    const y = Math.floor(index / columns);
    return { x, y };
  }

  drawChunk(chunk, tileset, image) {
    // this function draw chunk in correct position => chunk.x and chunk.y,
    // so you dont have to specify where to draw this

    // console.log(this.game.camera.x, this.game.camera.y);
    // chunk position
    const chunkX = chunk.x * tileset.tilewidth;
    const chunkY = chunk.y * tileset.tileheight;

    for (let i = 0; i < chunk.data.length; i++) {
      const row = Math.floor(i / chunk.width);
      const column = i - row * chunk.width;

      if (chunk.data[i] !== 0) {
        const tilePos = this.getTilePosFromSpritesheet(
          chunk.data[i],
          tileset.columns,
          tileset.tilewidth,
          tileset.tileheight
        );

        drawImagePartWithTransform(
          image,
          tilePos.x,
          tilePos.y,
          tileset.tilewidth,
          tileset.tileheight,
          0 + chunkX + column * tileset.tilewidth,
          0 + chunkY + row * tileset.tileheight,
          tileset.tilewidth,
          tileset.tileheight,
          false,
          false,
          0,
          0,
          0,
          this.game.ctx,
          this.game.camera.x,
          this.game.camera.y,
          false
        );
      }
    }
  }

  drawLayer(layerName, layers, tileset, image) {
    const layer = layers.filter((el) => el.name === layerName)[0];

    for (let i = 0; i < layer.chunks.length; i++) {
      this.drawChunk(layer.chunks[i], tileset, image);
    }
  }

  getChunkIndex(myX, myY, layerIndex, jsonData) {
    const tileX = Math.floor(myX / 16);
    const tileY = Math.floor(myY / 16);

    // TODO: on przeszukuje pierwszy layer, jeśli był by mniejszy (nie wiem czy to możliwe) to zwróci błędny chunk
    // TODO: 16 jest hardcoded a nie powinno
    const index = jsonData.layers[layerIndex].chunks.findIndex(
      (el) =>
        tileX >= el.x &&
        tileX <= el.x + el.width &&
        tileY >= el.y &&
        tileY <= el.y + el.height
    );

    return index;
    // console.log(index);
  }
}

// Vector

export class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  set(x, y) {
    this.x = x;
    this.y = y;
  }

  add(x, y) {
    this.x += x;
    this.y += y;
  }

  sub(x, y) {
    this.x -= x;
    this.y -= y;
  }

  mul(x, y) {
    this.x *= x;
    this.y *= y;
  }

  div(x, y) {
    this.x /= x;
    this.y /= y;
  }

  getLen() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize() {
    const len = this.getLen();
    if (len !== 0) {
      this.x /= len;
      this.y /= len;
    }
  }

  limit(max) {
    if (this.getLen() > max) {
      this.normalize();
      this.mul(max);
    }
  }

  getClone() {
    return new Vector(this.x, this.y);
  }

  setMag(mag) {
    this.normalize();
    this.mul(mag);
  }

  getDistance(v2) {
    const dx = this.x - v2.x;
    const dy = this.y - v2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  getCopy() {
    return new Vector(this.x, this.y);
  }

  getMag() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  getHeading() {
    return Math.atan2(this.y, this.x);
  }

  setAngleDeg(angle) {
    const rad = (angle * Math.PI) / 180;
    this.set(Math.cos(rad), Math.sin(rad));
  }

  setAngleRad(angle) {
    const rad = angle;
    this.set(Math.cos(rad), Math.sin(rad));
  }

  getAngleDeg() {
    const rad = Math.atan2(this.y, this.x);
    return (rad * 180) / Math.PI;
  }

  getAngleRad() {
    const rad = Math.atan2(this.y, this.x);
    return rad;
  }

  rotate(angle) {
    const rad = (angle * Math.PI) / 180;
    const x = this.x * Math.cos(rad) - this.y * Math.sin(rad);
    const y = this.x * Math.sin(rad) + this.y * Math.cos(rad);
    this.set(x, y);
  }

  static randomUnitVector() {
    const random1 = Math.random() * 2 - 1;
    const random2 = Math.random() * 2 - 1;
    const magnitude = Math.sqrt(random1 ** 2 + random2 ** 2);
    const unitX = random1 / magnitude;
    const unitY = random2 / magnitude;
    return new Vector(unitX, unitY);
  }
}

// FUNCTIONS

/**
 * Draws a transformed image part on the canvas.
 *
 * @param {Object} image - The image object to draw.
 * @param {number} sx - The x-coordinate of the upper-left corner of the source image.
 * @param {number} sy - The y-coordinate of the upper-left corner of the source image.
 * @param {number} sWidth - The width of the source image.
 * @param {number} sHeight - The height of the source image.
 * @param {number} dx - The x-coordinate in the destination canvas at which to place the top-left corner of the source image.
 * @param {number} dy - The y-coordinate in the destination canvas at which to place the top-left corner of the source image.
 * @param {number} dWidth - The width to draw the image on the destination canvas.
 * @param {number} dHeight - The height to draw the image on the destination canvas.
 * @param {boolean} isFlipX - Indicates if the image should be flipped horizontally.
 * @param {boolean} isFlipY - Indicates if the image should be flipped vertically.
 * @param {number} rotationDeg - The degree of rotation for the image.
 * @param {number} rotationOriginX - The x-coordinate of the rotation pivot point.
 * @param {number} rotationOriginY - The y-coordinate of the rotation pivot point.
 * @param {Object} ctx - The canvas rendering context.
 * @param {number} cameraX - The x-coordinate of the camera.
 * @param {number} cameraY - The y-coordinate of the camera.
 * @param {boolean} isDebug - Indicates if debug mode is enabled.
 * @return {void}
 */
export function drawImagePartWithTransform(
  image,
  sx,
  sy,
  sWidth,
  sHeight,
  dx,
  dy,
  dWidth,
  dHeight,
  isFlipX,
  isFlipY,
  rotationDeg,
  rotationOriginX,
  rotationOriginY,
  ctx,
  cameraX,
  cameraY,
  isDebug
) {
  // Zapamiętaj obecne ustawienia transformacji
  ctx.save();

  // Ustaw pivot jako punkt obracania
  ctx.translate(
    rotationOriginX + dx + sWidth / 2 - cameraX,
    rotationOriginY + dy + sHeight / 2 - cameraY
  );

  // Obróć obraz o podaną ilość stopni
  ctx.rotate((rotationDeg * Math.PI) / 180);

  // Odbij obraz w osi X, jeśli wymagane
  if (isFlipX) ctx.scale(-1, 1);

  // Odbij obraz w osi Y, jeśli wymagane
  if (isFlipY) ctx.scale(1, -1);

  // Przesuń punkt obrotu z powrotem do początkowego punktu
  ctx.translate(
    -(rotationOriginX + dx + sWidth / 2),
    -(rotationOriginY + dy + sHeight / 2)
  );

  // Narysuj konkretną część obrazka na canvasie
  ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);

  // Rysuj punkt obrotu
  if (isDebug) {
    ctx.beginPath();
    ctx.arc(
      rotationOriginX + dx + sWidth / 2,
      rotationOriginY + dy + sHeight / 2,
      2, // Promień punktu obrotu
      0,
      Math.PI * 2
    );
    ctx.closePath();
    ctx.stroke();
  }

  // Przywróć poprzednie ustawienia transformacji
  ctx.restore();
}
