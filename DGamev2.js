export const DGame = {
  canvas: null,
  ctx: null,
  scaleFactor: 1,

  mouse: {
    click: false,
    x: false,
    y: false,
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

    // this.canvas.addEventListener("keydown", (ev) => {
    //   if (!this.keys.key[ev.keyCode]) this.keys.key[ev.keyCode] = true;
    //   console.log(ev.keyCode);
    // });
    // this.canvas.addEventListener("keyup", (ev) => {
    //   if (this.keys.key[ev.keyCode]) this.keys.key[ev.keyCode] = false;
    // });
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

    this.ctx.scale(this.scaleFactor, this.scaleFactor);
    this.ctx.imageSmoothingEnabled = false;

    DGame.camera.set(0, 0);

    console.log(this);
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
    image: function (
      fromX,
      fromY,
      fromWidth,
      fromHeight,
      toX,
      toY,
      toWidth,
      toHeight,
      image
    ) {
      DGame.ctx.drawImage(
        image,
        fromX,
        fromY,
        fromWidth,
        fromHeight,
        toX - DGame.camera.x,
        toY - DGame.camera.y,
        toWidth,
        toHeight
      );
    },
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

  tiled: {
    getTilePos: function (id, jsonData) {
      // TODO: dodać wyszukiwanie tileset po nazwie "name":"spritesheet",
      const columns = jsonData.tilesets[0].columns;
      const tileWidth = jsonData.tilesets[0].tilewidth;
      const tileHeight = jsonData.tilesets[0].tileheight;

      const row = Math.floor(id / columns);
      const column = id - row * columns;

      return { x: column * tileWidth, y: row * tileHeight };
    },
  },

  clearRect: function () {
    this.ctx.fillStyle = "#898989";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  },

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
