// CLASSESS

/*
Sprite to jest obiekt który może być interaktywny 
1. nieporuszalne / poruszalne
2. tekstura / animacja

TODO: rysowanie, animowanie, pos/vel/acc, addForce, kolizja
*/
export class Sprite {
  constructor(x, y, width, height, ctx) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.ctx = ctx;

    this.viewType = "unset";
  }

  addTexture(fromX, fromY, fromWidth, fromHeight, image) {
    this.viewType = "texture";
    this.texture = {
      fromX,
      fromY,
      fromWidth,
      fromHeight,
      image,
      isFlipX: false,
      isFlipY: false,
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
      isFlipX: false,
      isFlipY: false,
      rotateDeg: 0,
      rotatePointX: 0,
      rotatePointY: 0,
      name: name,
    };

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

  draw(deltaTime, animName = "") {
    if (this.viewType === "texture") {
      drawImagePartWithTransform(
        this.texture.image,
        this.texture.fromX,
        this.texture.fromY,
        this.texture.fromWidth,
        this.texture.fromHeight,
        this.x,
        this.y,
        this.texture.fromWidth,
        this.texture.fromHeight,
        this.texture.isFlipX,
        this.texture.isFlipY,
        this.texture.rotateDeg,
        this.texture.rotatePointX,
        this.texture.rotatePointY,
        this.ctx,
        0,
        0,
        true
      );
    } else if (this.viewType === "anim") {
      this.anim[animName].currFrameTime += deltaTime;
      if (this.anim[animName].currFrameTime >= this.anim[animName].frameTime) {
        this.anim[animName].currFrameTime -= this.anim[animName].frameTime;
        this.anim[animName].currFrame =
          (this.anim[animName].currFrame + 1) % this.anim[animName].frames;
      }
      drawImagePartWithTransform(
        this.anim[animName].image,
        this.anim[animName].fromX +
          this.anim[animName].fromWidth * this.anim[animName].currFrame,
        this.anim[animName].fromY,
        this.anim[animName].fromWidth,
        this.anim[animName].fromHeight,
        this.x,
        this.y,
        this.anim[animName].fromWidth,
        this.anim[animName].fromHeight,
        this.anim[animName].isFlipX,
        this.anim[animName].isFlipY,
        this.anim[animName].rotateDeg,
        this.anim[animName].rotatePointX,
        this.anim[animName].rotatePointY,
        this.ctx,
        0,
        0,
        true
      );
    }
    this.ctx.beginPath();
    this.ctx.rect(this.x, this.y, this.width, this.height);
    this.ctx.stroke();
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
