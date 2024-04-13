// FUNCTIONS

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
