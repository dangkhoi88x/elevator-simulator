import { useEffect, useMemo } from 'react';
import { CanvasTexture, SRGBColorSpace } from 'three';

const FONT = '600 64px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

// Nhãn chữ luôn quay mặt về camera: vẽ chữ lên canvas rồi dán lên sprite
export function Label({ text, position, height = 0.3, color = '#ffffff', border, background }) {
  const { texture, aspect } = useMemo(
    () => drawLabel(text, { color, border, background }),
    [text, color, border, background],
  );

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <sprite position={position} scale={[height * aspect, height, 1]} renderOrder={10}>
      <spriteMaterial map={texture} transparent depthTest={false} />
    </sprite>
  );
}

function drawLabel(text, { color, border, background }) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = FONT;
  const padX = background ? 28 : 6;
  const h = 96;
  const w = Math.ceil(ctx.measureText(text).width + padX * 2);
  canvas.width = w;
  canvas.height = h;

  if (background) {
    ctx.fillStyle = background;
    ctx.beginPath();
    ctx.roundRect(4, 4, w - 8, h - 8, (h - 8) / 2);
    ctx.fill();
    if (border) {
      ctx.lineWidth = 6;
      ctx.strokeStyle = border;
      ctx.stroke();
    }
  }

  ctx.font = FONT; // đổi kích thước canvas làm reset context
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h / 2 + 4);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return { texture, aspect: w / h };
}
