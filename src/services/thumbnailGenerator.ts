const THUMBNAIL_WIDTH = 400;
const THUMBNAIL_HEIGHT = 300;

export const generateThumbnail = (canvas: HTMLCanvasElement): string => {
  try {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = THUMBNAIL_WIDTH;
    tempCanvas.height = THUMBNAIL_HEIGHT;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return '';

    const srcAspect = canvas.width / canvas.height;
    const dstAspect = THUMBNAIL_WIDTH / THUMBNAIL_HEIGHT;

    let sx = 0, sy = 0, sw = canvas.width, sh = canvas.height;
    if (srcAspect > dstAspect) {
      sw = canvas.height * dstAspect;
      sx = (canvas.width - sw) / 2;
    } else {
      sh = canvas.width / dstAspect;
      sy = (canvas.height - sh) / 2;
    }

    ctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);
    return tempCanvas.toDataURL('image/jpeg', 0.6);
  } catch (e) {
    console.error('Failed to generate thumbnail', e);
    return '';
  }
};

export const generateThumbnailFromStage = (
  stageRef: React.RefObject<{ getCanvas: () => HTMLCanvasElement | null } | null>
): string => {
  const canvas = stageRef.current?.getCanvas();
  if (!canvas) return '';
  return generateThumbnail(canvas);
};

export const generateModePlaceholder = (mode: string): string => {
  const canvas = document.createElement('canvas');
  canvas.width = THUMBNAIL_WIDTH;
  canvas.height = THUMBNAIL_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const colors: Record<string, string[]> = {
    GAME: ['#f97316', '#ea580c'],
    APP: ['#3b82f6', '#2563eb'],
    HARDWARE: ['#10b981', '#059669'],
  };
  const [c1, c2] = colors[mode] || ['#6b7280', '#4b5563'];

  const grad = ctx.createLinearGradient(0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);
  grad.addColorStop(0, c1);
  grad.addColorStop(1, c2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);

  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.font = 'bold 80px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const icons: Record<string, string> = {
    GAME: '\u{1F3AE}',
    APP: '\u{1F4F1}',
    HARDWARE: '\u2699\uFE0F',
  };
  ctx.fillText(icons[mode] || '?', THUMBNAIL_WIDTH / 2, THUMBNAIL_HEIGHT / 2);

  return canvas.toDataURL('image/jpeg', 0.5);
};
