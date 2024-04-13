export const DGame = {
  canvas: null,
  ctx: null,
  scaleFactor: 1,
  isDebug: true,

  mouse: {
    click: false,
    x: false,
    y: false,
  },

  keys: {
    key: [],
  },

  camera: {
    x: 0,
    y: 0,
    set: function (x, y) {
      this.x = x - DGame.canvas.width / (2 * DGame.scaleFactor);
      this.y = y - DGame.canvas.height / (2 * DGame.scaleFactor);
    },
  },

  init: function (canvasID, canvasWidth, canvasHeight, scaleFactor) {
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

    DGame.camera.set(0, 0);

    // console.log(this);
  },

  vector: {
    // magnitude and direction
    // magnitude is a length
    // x , y
    // function createVector(x,y) return vector
    create: function (x, y) {
      return { x: x, y: y };
    },

    unitVector: function (vector) {
      // Obliczanie długości wektora
      var magnitude = Math.sqrt(vector.x ** 2 + vector.y ** 2);

      // Sprawdzenie, czy długość wektora nie jest równa zero (aby uniknąć dzielenia przez zero)
      if (magnitude === 0) {
        return { x: 0, y: 0 }; // Zwrócenie wektora zerowego
      }

      // Obliczenie składowych wektora jednostkowego
      var unitX = vector.x / magnitude;
      var unitY = vector.y / magnitude;

      return { x: unitX, y: unitY };
    },

    mag: function (vector) {
      return Math.sqrt(vector.x ** 2 + vector.y ** 2);
    },

    add: function (vector1, vector2) {
      return { x: vector1.x + vector2.x, y: vector1.y + vector2.y };
    },

    sub: function (vector1, vector2) {
      return { x: vector1.x - vector2.x, y: vector1.y - vector2.y };
    },

    mult: function (vector, num) {
      return { x: vector.x * num, y: vector.y * num };
    },

    // setMag(vector, length)
    // limit(vector,length) if mag > lenth then mag = length otherwise mag = mag
    // Funkcja ustawiająca wielkość wektora
    setMag: function (vector, magnitude) {
      var currentMagnitude = Math.sqrt(vector.x ** 2 + vector.y ** 2);
      if (currentMagnitude === 0) {
        return { x: magnitude, y: 0 }; // Jeśli wektor ma zerową długość, ustaw wielkość na magnitude i kierunek na x
      }
      var factor = magnitude / currentMagnitude;
      return { x: vector.x * factor, y: vector.y * factor };
    },

    // Funkcja ograniczająca wielkość wektora do maksymalnej wartości
    limit: function (vector, maxMagnitude) {
      var currentMagnitude = Math.sqrt(vector.x ** 2 + vector.y ** 2);
      if (currentMagnitude <= maxMagnitude) {
        return vector; // Jeśli aktualna wielkość wektora jest mniejsza lub równa maksymalnej wartości, zwróć wektor bez zmian
      }
      var factor = maxMagnitude / currentMagnitude;
      return { x: vector.x * factor, y: vector.y * factor };
    },

    randomUnitVector: function () {
      // Losowanie dwóch wartości z zakresu [-1, 1]
      var random1 = Math.random() * 2 - 1;
      var random2 = Math.random() * 2 - 1;

      // Obliczanie długości wektora
      var magnitude = Math.sqrt(random1 ** 2 + random2 ** 2);

      // Normalizacja wektora do jednostkowego
      var unitX = random1 / magnitude;
      var unitY = random2 / magnitude;

      return { x: unitX, y: unitY };
    },
  },

  draw: {
    drawImagePartWithTransform: function (
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
      pivotX,
      pivotY
    ) {
      // Zapamiętaj obecne ustawienia transformacji
      DGame.ctx.save();

      // Ustaw pivot jako punkt obracania
      DGame.ctx.translate(
        pivotX + dx + sWidth / 2 - DGame.camera.x,
        pivotY + dy + sHeight / 2 - DGame.camera.y
      );

      // Obróć obraz o podaną ilość stopni
      DGame.ctx.rotate((rotationDeg * Math.PI) / 180);

      // Odbij obraz w osi X, jeśli wymagane
      if (isFlipX) DGame.ctx.scale(-1, 1);

      // Odbij obraz w osi Y, jeśli wymagane
      if (isFlipY) DGame.ctx.scale(1, -1);

      // Przesuń punkt obrotu z powrotem do początkowego punktu
      DGame.ctx.translate(
        -(pivotX + dx + sWidth / 2),
        -(pivotY + dy + sHeight / 2)
      );

      // Narysuj konkretną część obrazka na canvasie
      DGame.ctx.drawImage(
        image,
        sx,
        sy,
        sWidth,
        sHeight,
        dx,
        dy,
        dWidth,
        dHeight
      );

      // Przywróć poprzednie ustawienia transformacji
      DGame.ctx.restore();
    },

    image: function (
      fromX,
      fromY,
      fromWidth,
      fromHeight,
      toX,
      toY,
      toWidth,
      toHeight,
      image,
      isFlipx = false
    ) {
      DGame.ctx.save();
      // DGame.ctx.translate(DGame.canvas.width / 2, 0);
      DGame.ctx.scale(isFlipx ? -1 : 1, 1);

      DGame.ctx.drawImage(
        image,
        fromX,
        fromY,
        fromWidth,
        fromHeight,
        isFlipx
          ? -toX - DGame.canvas.width / 2 - toWidth - DGame.camera.x
          : toX - DGame.camera.x,
        toY - DGame.camera.y,
        toWidth,
        toHeight
      );

      DGame.ctx.restore();
    },

    // anim() {},

    circle: function (x, y, radius) {
      DGame.ctx.beginPath();
      DGame.ctx.arc(
        x - DGame.camera.x,
        y - DGame.camera.y,
        radius,
        0,
        Math.PI * 2
      );
      DGame.ctx.stroke();
    },

    rect: function (x, y, width, height) {
      DGame.ctx.beginPath();
      DGame.ctx.rect(x - DGame.camera.x, y - DGame.camera.y, width, height);
      DGame.ctx.stroke();
    },

    text: function (x, y, text) {
      DGame.ctx.fillText(text, x - DGame.camera.x, y - DGame.camera.y);
    },

    line: function (x, y, tox, toy) {
      DGame.ctx.beginPath();
      DGame.ctx.moveTo(x - DGame.camera.x, y - DGame.camera.y);
      DGame.ctx.lineTo(tox - DGame.camera.x, toy - DGame.camera.y);
      DGame.ctx.stroke();
    },
  },

  sprite: {
    createCircle: function (x, y, radius) {
      this.x = x;
      this.y = y;
      this.radius = radius;

      return { x: x, y: y, radius: radius };
    },

    createRect: function (x, y, width, height) {
      // x and y is center of sprite, like circle !!!!
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;

      return { x: x, y: y, width: width, height: height };
    },

    addImage: function (fromX, fromY, fromWidth, fromHeight, img, sprite) {
      return {
        ...sprite,
        image: {
          fromX,
          fromY,
          fromWidth,
          fromHeight,
          img: img,
          isFlipX: false,
          isFlipY: false,
          rotateDeg: 0,
          rotatePointX: 0,
          rotatePointY: 0,
        },
      };
    },

    addAnim: function (
      fromX,
      fromY,
      fromWidth,
      fromHeight,
      frames,
      img,
      sprite
    ) {
      return {
        ...sprite,
        anim: {
          fromX,
          fromY,
          fromWidth,
          frames,
          fromHeight,
          img,
          currFrame: 0,
          frameTime: 100,
          currFrameTime: 0,
          isFlipX: false,
          isFlipY: false,
          rotateDeg: 0,
          rotatePointX: 0,
          rotatePointY: 0,
        },
      };
    },

    draw: function (sprite, deltaTime) {
      if (sprite.image) {
        DGame.draw.image(
          sprite.image.fromX,
          sprite.image.fromY,
          sprite.image.fromWidth,
          sprite.image.fromHeight,
          sprite.x - sprite.image.fromWidth / 2,
          sprite.y - sprite.image.fromHeight / 2,
          sprite.image.fromWidth,
          sprite.image.fromHeight,
          sprite.image.img,
          sprite.image.isFlipX
        );
        DGame.draw.drawImagePartWithTransform(
          sprite.image.img,
          sprite.image.fromX,
          sprite.image.fromY,
          sprite.image.fromWidth,
          sprite.image.fromHeight,
          sprite.x - sprite.image.fromWidth / 2,
          sprite.y - sprite.image.fromHeight / 2,
          sprite.image.fromWidth,
          sprite.image.fromHeight,
          sprite.image.isFlipX,
          sprite.image.isFlipY,
          sprite.image.rorateDeg,
          sprite.image.rotatePointX,
          sprite.image.rotatePointY
        );
      } else if (sprite.anim) {
        // DGame.draw.image(
        //   sprite.anim.fromX + sprite.anim.fromWidth * sprite.anim.currFrame,
        //   sprite.anim.fromY,
        //   sprite.anim.fromWidth,
        //   sprite.anim.fromHeight,
        //   sprite.x - sprite.anim.fromWidth / 2,
        //   sprite.y - sprite.anim.fromHeight / 2,
        //   sprite.anim.fromWidth,
        //   sprite.anim.fromHeight,
        //   sprite.anim.img,
        //   sprite.anim.isFlipX
        // );
        DGame.draw.drawImagePartWithTransform(
          sprite.anim.img,
          sprite.anim.fromX + sprite.anim.fromWidth * sprite.anim.currFrame,
          sprite.anim.fromY,
          sprite.anim.fromWidth,
          sprite.anim.fromHeight,
          sprite.x - sprite.anim.fromWidth / 2,
          sprite.y - sprite.anim.fromHeight / 2,
          sprite.anim.fromWidth,
          sprite.anim.fromHeight,
          sprite.anim.isFlipX,
          sprite.anim.isFlipY,
          sprite.anim.rorateDeg,
          sprite.anim.rotatePointX,
          sprite.anim.rotatePointY
        );

        if (sprite.anim.currFrameTime < sprite.anim.frameTime) {
          sprite.anim.currFrameTime += deltaTime;
        } else {
          if (sprite.anim.currFrame < sprite.anim.frames - 1) {
            sprite.anim.currFrame++;
            sprite.anim.currFrameTime = 0;
          } else {
            sprite.anim.currFrame = 0;
            sprite.anim.currFrameTime = 0;
          }
        }
        // console.log(sprite.anim.currFrame);
      }
      if (DGame.isDebug) {
        if (sprite.radius) {
          DGame.draw.circle(sprite.x, sprite.y, sprite.radius);
          // draw origin
          DGame.draw.circle(sprite.x, sprite.y, 1);
        } else {
          DGame.draw.rect(
            sprite.x - sprite.width / 2,
            sprite.y - sprite.height / 2,
            sprite.width,
            sprite.height
          );
          // draw origin
          DGame.draw.circle(sprite.x, sprite.y, 1);
        }
      }
    },
  },

  tiled: {
    getTilePosFromSpritesheet: function (
      id,
      tilesetsColumns,
      tilesetsTileWidth,
      tilkesetsTileHeight
    ) {
      // TODO: dodać wyszukiwanie tileset po nazwie "name":"spritesheet",

      const row = Math.floor((id - 1) / tilesetsColumns);
      const column = id - 1 - row * tilesetsColumns;

      return { x: column * tilesetsTileWidth, y: row * tilkesetsTileHeight };
    },

    get2dPosFrom1dArray: function (index, columns) {
      const x = index % columns;
      const y = Math.floor(index / columns);
      return { x, y };
    },

    drawChunk: function (chunk, tileset, image) {
      // this function draw chunk in correct position => chunk.x and chunk.y,
      // so you dont have to specify where to draw this

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

          // DGame.draw.image(
          //   tilePos.x,
          //   tilePos.y,
          //   tileset.tilewidth,
          //   tileset.tileheight,
          //   0 + chunkX + column * tileset.tilewidth,
          //   0 + chunkY + row * tileset.tileheight,
          //   tileset.tilewidth,
          //   tileset.tileheight,
          //   image
          // );
          DGame.draw.drawImagePartWithTransform(
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
            0
          );
        }
      }
    },

    drawLayer(layerName, layers, tileset, image) {
      const layer = layers.filter((el) => el.name === layerName)[0];

      for (let i = 0; i < layer.chunks.length; i++) {
        this.drawChunk(layer.chunks[i], tileset, image);
      }
    },

    getChunkIndex: function (myX, myY, layerIndex, jsonData) {
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
    },
  },

  clearRect: function () {
    this.ctx.fillStyle = "#898989";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  },

  physics: {
    isCircleRectangleCollision: function (
      circleX,
      circleY,
      circleRadius,
      rectX,
      rectY,
      rectWidth,
      rectHeight
    ) {
      // Find the closest point on the rectangle
      let closestX = Math.max(rectX, Math.min(circleX, rectX + rectWidth));
      let closestY = Math.max(rectY, Math.min(circleY, rectY + rectHeight));

      // this.drawLine(circleX, circleY, closestX, closestY);

      // Calculate the distance between the center of the circle and the closest point on the rectangle
      let distanceX = circleX - closestX;
      let distanceY = circleY - closestY;

      // Check if the distance is less than the circle's radius (collision occurs)
      return (
        distanceX * distanceX + distanceY * distanceY <
        circleRadius * circleRadius
      );
    },
    isAABBCollision: function (
      rectX,
      rectY,
      rectWidth,
      rectHeight,
      rect2X,
      rect2Y,
      rect2Width,
      rect2Height
    ) {
      // Sprawdź, czy prostokąty nachodzą na siebie wzdłuż osi X
      let xOverlap =
        rectX + rectWidth >= rect2X && rect2X + rect2Width >= rectX;

      // Sprawdź, czy prostokąty nachodzą na siebie wzdłuż osi Y
      let yOverlap =
        rectY + rectHeight >= rect2Y && rect2Y + rect2Height >= rectY;

      // Jeśli istnieje nakładanie się wzdłuż obu osi, to znaczy, że występuje kolizja
      return xOverlap && yOverlap;
    },
  },

  math: {
    randomNumber: function (min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
  },
};

//

// --- this is my current game loop ---
//
// requestAnimationFrame(gameLoop);
//
// let lastTime = 0;
// function gameLoop(timestamp) {
//   const deltaTime = +(timestamp - lastTime).toFixed(2);
//   lastTime = timestamp;
//
//   update(deltaTime);
//
//   draw(deltaTime);
//
//   requestAnimationFrame(gameLoop);
// }
//
// --- ||| ---
