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
      // click: false,

      isMouseDown: false,
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
      this.mouse.isMouseDown = true;
      this.mouse.x = Math.round(ev.offsetX / this.scaleFactor);
      this.mouse.y = Math.round(ev.offsetY / this.scaleFactor);
    });
    this.canvas.addEventListener("mouseup", (ev) => {
      this.mouse.isMouseDown = false;
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

  // return array of tiles that current sprite overlaps with
  /**
   * Return array of tiles that current sprite overlaps with
   * @param {Array} tiles Array of tiles to check
   * @param {number} [x=this.x] X position of sprite to check
   * @param {number} [y=this.y] Y position of sprite to check
   * @returns {Array} Array of overlapping tiles
   */
  getOverlappingTiles(tiles, x = this.x, y = this.y) {
    const overlappingTiles = [];
    for (let i = 0; i < tiles.length; i++) {
      if (
        x < tiles[i].x + tiles[i].width &&
        x + this.width > tiles[i].x &&
        y < tiles[i].y + tiles[i].height &&
        this.height + y > tiles[i].y
      ) {
        overlappingTiles.push(tiles[i]);
      }
    }
    return overlappingTiles;
  }

  checkCollisionAABBNew(
    selfX,
    selfY,
    selfW,
    selfH,
    rx,
    ry,
    rw,
    rh,
    isDraw = false,
    tolerance = 0
  ) {
    // Ustalenie długości odcinków centerToCenterX oraz centerToCenterY.
    // Określają one poziomą i pionową odległość pomiędzy środkami obiektów.
    const centerToCenterX = rx + rw / 2 - (selfX + selfW / 2);
    const centerToCenterY = ry + rh / 2 - (selfY + selfH / 2);

    // Teraz obliczamy sume długości połowy wysokości obiektów i połowy szerokości obiektów.
    // Czyli połowa szerokości prostokta i połowa szerokości drugiego prostokta,
    // oraz połowa wysokości prostokta i połowa wysokości drugiego prostokta.
    const combinedHalfWidths = selfW / 2 + rw / 2;
    const combinedHalfHeights = selfH / 2 + rh / 2;

    // Porównuje odległość od środka pierwszego prostokąta do środka drugiego,
    // z połową szerokości/wysokości prostokąta pierwszego i drugiego (dodaje je).
    // Jeśli dwie połowy szerokości połączone ze sobą są mniejsze od odległości od jednego środka do drugiego,
    // to prostokąty nachodzą na siebie w osi X lub w osi Y.

    // Sprawdzam czy prostokąty nachodzą na siebie w osi X.
    const isxOverlap = Math.abs(centerToCenterX) < combinedHalfWidths;

    // Sprawdzam czy prostokąty nachodą na siebie w osi Y.
    const isyOverlap = Math.abs(centerToCenterY) < combinedHalfHeights;

    // jeśli nachodą na siebie w osi X i w osi Y, to prostokąty nachodzą na siebie.

    // Potrzebuje obliczyć o ile nachodzą na siebie obiekty na osi X i o ile na osi Y.
    // Od długości połączonych połówek, odejmuje odległość środek-środek,
    // co da mi wartość o ile pokrywają sie prostokąty.
    // Robie to w osi X i w osi Y.

    const overlapX = combinedHalfWidths - Math.abs(centerToCenterX);
    const overlapY = combinedHalfHeights - Math.abs(centerToCenterY);

    // Kolejny krok, to sprawdzenie czy mniejsze jest overlapX czy overlapY.
    // To, które jest mniejsze, wskazuje oś, na której obiekty się naszły.

    // jeśli overlapX jest mniejsze od overlapY,
    // to mniej nakładają sie na siebie w osi X, czyli jedno jest nad lub pod drugim.
    // Jeśli odwrotnie, to po jednej stronie lub po drugiej.

    const isLeftOrRight = overlapX < overlapY;
    const isTopOrBottom = !isLeftOrRight; // lub overlapX >= overlapY

    // Jeżeli overlapX jest wieksze od overlapY(góra-dół) a centerToCenterY jest dodatnie oznacza,
    // że obiekt pierwszy naszedł na drugi od dołu
    // (bo środek jednego jest niżej od środka drugiego(centerToCenterY dodatnie)).

    const isTop = isTopOrBottom && centerToCenterY < 0;
    const isBottom = isTopOrBottom && centerToCenterY > 0;
    const isLeft = isLeftOrRight && centerToCenterX < 0;
    const isRight = isLeftOrRight && centerToCenterX > 0;

    // jesli tolerancja jest większ od zera to róznica między overlapX i overlapY musi być wieksza od tolerancji aby uznać to za kolizje.
    // Czyli.. jeśli kolizja jest narożnik do narożnika, to nie uznawaj kolizji jeśli jedna strona(overlapX) będzie nachodzić na drugą(overlapY) słabiej n iż tolerancja, czyli np 1px.
    // Czyli.. uznaj kolizje tylko wtedy jeśli jedna strona nachodzi bardziej od drugiej o tolerancje.
    // Czyli w ptzypadku gdy mamy tolerancje 1px i jeśli od prawej strony nachodzi o 0.7 a od dołu o 0.7 to nie uznaj kolizji, lub prawej 0.7 a od dołu 1.1 to nie uznaj kolizji, ale jeśli od prawej 0.7 a od dołu 2.1 to uznaj kolizje, bo różnica jest wieksza od tolerancji.
    if (tolerance > 0 && Math.abs(overlapX - overlapY) < tolerance)
      return false;

    const isCollision = isxOverlap && isyOverlap;
    const side = `${isTop ? "top" : ""}${isBottom ? "bottom" : ""}${
      isLeft ? "left" : ""
    }${isRight ? "right" : ""}`;

    if (isDraw) {
      // Narysuj te linie
      const rectPoint1 = { x: rx + rw / 2, y: ry + rh / 2 };
      const rectPoint2 = {
        x: rx + rw / 2,
        y: selfY + selfH / 2,
      };
      const myPoint1 = {
        x: selfX + selfW / 2,
        y: selfY + selfH / 2,
      };
      const myPoint2 = { x: rx + rw / 2, y: selfY + selfH / 2 };

      // narysuj linie jeśli jest kolizja
      if (isCollision) {
        drawLineOnMap(
          myPoint1.x,
          myPoint1.y,
          myPoint2.x,
          myPoint2.y,
          this.game.ctx,
          this.game.camera,
          "red",
          2
        );
        drawLineOnMap(
          rectPoint1.x,
          rectPoint1.y,
          rectPoint2.x,
          rectPoint2.y,
          this.game.ctx,
          this.game.camera,
          "red",
          2
        );
      }
    }
    return isCollision
      ? { side, centerToCenterX, centerToCenterY, overlapX, overlapY }
      : false;
  }

  /**
   * Check on which side of the tile current sprite is located
   * @param {Object} tile Tile to check
   * @returns {String} Side of the tile where the sprite is located (top, right, bottom, left)
   */
  getSideOfTile(tile) {
    const isAbove = this.y + this.height / 2 >= tile.y + tile.height / 2;
    const isBelow = this.y + this.height / 2 <= tile.y + tile.height / 2;
    const isLeft = this.x + this.width / 2 >= tile.x + tile.width / 2;
    const isRight = this.x + this.width / 2 <= tile.x + tile.width / 2;

    if (isLeft) {
      return "left";
    }
    if (isRight) {
      return "right";
    }
    if (isAbove) {
      return "top";
    }
    if (isBelow) {
      return "bottom";
    }

    return null;
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
        this.game.isDebug
      );
    }
    // hitbox
    if (this.game.isDebug) {
      drawRectOnMap(
        this.x,
        this.y,
        this.width,
        this.height,
        this.game.ctx,
        this.game.camera
      );
    }
  }
}

export class Tiled {
  constructor(game, jsonData, image) {
    this.game = game;
    this.jsonData = jsonData;
    this.image = image;

    this.mapSize = null;

    this.collidable = [];
    this.highlight = [];
    this.preload();
  }

  preload() {
    // get world bounds firstly
    this.mapSize = this.getMapSize();

    // add tiles to collidable
    this.addTilesToCollidable("walls");
  }

  getWorldBounds() {
    return {
      x: 0,
      y: 0,
      width: this.mapSize.width,
      height: this.mapSize.height,
    };
  }

  /**
   * Checks if the given object is fully inside the map boundaries.
   *
   * @param {number} x - The x-coordinate of the object's top-left corner.
   * @param {number} y - The y-coordinate of the object's top-left corner.
   * @param {number} width - The width of the object.
   * @param {number} height - The height of the object.
   * @return {boolean} Whether the object is fully inside the map boundaries.
   */
  isInside(x, y, width, height) {
    const worldBounds = this.getWorldBounds();
    return (
      x >= worldBounds.x &&
      x + width <= worldBounds.x + worldBounds.width &&
      y >= worldBounds.y &&
      y + height <= worldBounds.y + worldBounds.height
    );
  }

  addTilesToCollidable(layerName) {
    const layer = this.jsonData.layers.filter((el) => el.name === layerName)[0];

    layer.chunks.forEach((chunk) => {
      chunk.data.forEach((el, index) => {
        if (el !== 0) {
          const pos = this.get2dPosFrom1dArray(index, 16);
          this.collidable.push({
            x: pos.x * 16 + chunk.x * 16,
            y: pos.y * 16 + chunk.y * 16,
            width: 16,
            height: 16,
          });
        }
      });
    });
  }

  drawDebug() {
    if (!this.game.isDebug) return;

    // draw world bounds
    drawRectOnMap(
      0,
      0,
      this.mapSize.width,
      this.mapSize.height,
      this.game.ctx,
      this.game.camera
    );

    // draw collidable
    this.collidable.forEach((el) =>
      drawRectOnMap(el.x, el.y, 16, 16, this.game.ctx, this.game.camera)
    );

    // draw highlight
    this.highlight.forEach((el) =>
      drawRectOnMap(
        el.x,
        el.y,
        el.width,
        el.height,
        this.game.ctx,
        this.game.camera,
        "red"
      )
    );

    // highlight tile
  }

  highlightTiles(tiles) {
    this.highlight = tiles;
  }

  getMapSize() {
    // Pobiera rozmiar mapy na podstawie ostatniego chunka w każdym warstwie.
    let width = 0;
    let height = 0;

    this.jsonData.layers.forEach((layer) => {
      // sprawdza ostatni chunk w każdej warstwie i ten najwiekszy zapisuje

      const lastChunk = layer.chunks[layer.chunks.length - 1];

      // sprawdzamy, czy rozmiar mapy musi zostać zaktualizowany
      // największa wartość x koordynaty ostatniego chunka w warstwie + szerokość tego chunka
      // jest większa niż aktualny rozmiar mapy w osi x
      if (
        lastChunk.x * this.jsonData.tilewidth +
          lastChunk.width * this.jsonData.tilewidth >
        width
      ) {
        width =
          lastChunk.x * this.jsonData.tilewidth +
          lastChunk.width * this.jsonData.tilewidth;
      }
      // największa wartość y koordynaty ostatniego chunka w warstwie + wysokość tego chunka
      // jest większa niż aktualny rozmiar mapy w osi y
      if (
        lastChunk.y * this.jsonData.tileheight +
          lastChunk.height * this.jsonData.tileheight >
        height
      ) {
        height =
          lastChunk.y * this.jsonData.tileheight +
          lastChunk.height * this.jsonData.tileheight;
      }
    });

    return { width, height };
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

  /**
   * @description
   *   Generates 2D position from 1D array index.
   *
   * @param {number} index
   *   1D array index.
   * @param {number} columns
   *   Number of columns in 2D array.
   *
   * @returns {{x: number, y: number}}
   *   2D position.
   */
  get2dPosFrom1dArray(index, columns) {
    const x = index % columns;
    const y = Math.floor(index / columns);
    return { x, y };
  }

  drawChunk(chunk, tileset) {
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
          this.image,
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
          this.game.isDebug
        );
      }
    }
  }

  drawLayer(layerName) {
    const layer = this.jsonData.layers.filter((el) => el.name === layerName)[0];

    for (let i = 0; i < layer.chunks.length; i++) {
      this.drawChunk(layer.chunks[i], this.jsonData.tilesets[0], this.image);
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
  /**
   * @param {number} x The x-coordinate.
   * @param {number} y The y-coordinate.
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * @param {number} x The new x-coordinate.
   * @param {number} y The new y-coordinate.
   */
  set(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * @param {Vector} vector The vector to add to this vector.
   */
  add(vector) {
    this.x += vector.x;
    this.y += vector.y;
  }

  /**
   * @param {number} x The value to subtract from the x-coordinate.
   * @param {number} y The value to subtract from the y-coordinate.
   */
  sub(x, y) {
    this.x -= x;
    this.y -= y;
  }

  /**
   * @param {number} x The value to multiply the x-coordinate by.
   * @param {number} y The value to multiply the y-coordinate by.
   */
  mul(x, y) {
    this.x *= x;
    this.y *= y;
  }

  /**
   * @param {number} x The value to divide the x-coordinate by.
   * @param {number} y The value to divide the y-coordinate by.
   */
  div(x, y) {
    this.x /= x;
    this.y /= y;
  }

  /**
   * @returns {number} The magnitude of the vector.
   */
  getLen() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * Normalizes the vector if it's not zero-length.
   */
  normalize() {
    const len = this.getLen();
    if (len !== 0) {
      this.x /= len;
      this.y /= len;
    } else {
      // console.log("Tried to normalize a zero-length vector.");
    }
  }

  /**
   * @param {number} max The maximum magnitude.
   */
  limit(max) {
    if (this.getLen() > max) {
      this.normalize();
      this.mul(max);
    } else if (max === undefined) {
      console.log("No max value provided.");
    }
  }

  /**
   * @returns {Vector} A new vector with the same coordinates.
   */
  getClone() {
    return new Vector(this.x, this.y);
  }

  /**
   * @param {number} mag The new magnitude.
   */
  setMag(mag) {
    this.normalize();
    this.mul(mag);
  }

  /**
   * @param {Vector} v2 The other vector.
   * @returns {number} The distance between this vector and the other vector.
   */
  getDistance(v2) {
    const dx = this.x - v2.x;
    const dy = this.y - v2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * @returns {Vector} A new vector with the same coordinates.
   */
  getCopy() {
    return new Vector(this.x, this.y);
  }

  /**
   * @returns {number} The magnitude of the vector.
   */
  getMag() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * @returns {number} The angle of the vector in radians.
   */
  getHeading() {
    return Math.atan2(this.y, this.x);
  }

  /**
   * @param {number} angle The new angle in degrees.
   */
  setAngleDeg(angle) {
    if (angle !== undefined) {
      const rad = (angle * Math.PI) / 180;
      this.set(Math.cos(rad), Math.sin(rad));
    } else {
      console.log("No angle value provided.");
    }
  }

  /**
   * @param {number} angle The new angle in radians.
   */
  setAngleRad(angle) {
    if (angle !== undefined) {
      const rad = angle;
      this.set(Math.cos(rad), Math.sin(rad));
    } else {
      console.log("No angle value provided.");
    }
  }

  /**
   * @returns {number} The angle of the vector in degrees.
   */
  getAngleDeg() {
    const rad = Math.atan2(this.y, this.x);
    return (rad * 180) / Math.PI;
  }

  /**
   * @returns {number} The angle of the vector in radians.
   */
  getAngleRad() {
    const rad = Math.atan2(this.y, this.x);
    return rad;
  }

  /**
   * @param {number} angle The angle in degrees to rotate by.
   */
  rotate(angle) {
    if (angle !== undefined) {
      const rad = (angle * Math.PI) / 180;
      const x = this.x * Math.cos(rad) - this.y * Math.sin(rad);
      const y = this.x * Math.sin(rad) + this.y * Math.cos(rad);
      this.set(x, y);
    } else {
      console.log("No angle value provided.");
    }
  }

  /**
   * @returns {Vector} A new unit vector.
   */
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
    ctx.strokeStyle = "grey";
    ctx.beginPath();
    ctx.arc(
      rotationOriginX + dx + sWidth / 2,
      rotationOriginY + dy + sHeight / 2,
      0.1, // Promień punktu obrotu
      0,
      Math.PI * 2
    );
    ctx.closePath();
    ctx.stroke();
    ctx.strokeStyle = "black";
  }

  // Przywróć poprzednie ustawienia transformacji
  ctx.restore();
}

// draw rectangle on map
export function drawRectOnMap(
  x,
  y,
  width,
  height,
  ctx,
  camera,
  color = "black",
  lineWidth = 1
) {
  // console.log(
  //   `Drawing rect on map: x=${x}, y=${y}, width=${width}, height=${height}, camera=${camera}`
  // );
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.rect(x - camera.x, y - camera.y, width, height);
  ctx.stroke();
  ctx.closePath();
  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;
}

export function drawLineOnMap(
  x1,
  y1,
  x2,
  y2,
  ctx,
  camera,
  color = "black",
  lineWidth = 1
) {
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(x1 - camera.x, y1 - camera.y);
  ctx.lineTo(x2 - camera.x, y2 - camera.y);
  ctx.stroke();
  ctx.closePath();
  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;
}
