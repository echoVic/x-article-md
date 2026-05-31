export async function copyCodeImage(code: string, language: string): Promise<boolean> {
  const blob = await renderCodeToPng(code, language);
  return copyPngBlob(blob);
}

export async function copySvgImage(svg: string): Promise<boolean> {
  const blob = await renderSvgToPng(svg);
  return copyPngBlob(blob);
}

async function copyPngBlob(blob: Blob): Promise<boolean> {
  if (!("ClipboardItem" in window) || !navigator.clipboard?.write) {
    return false;
  }

  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        "image/png": blob,
      }),
    ]);
    return true;
  } catch {
    return false;
  }
}

async function renderCodeToPng(code: string, language: string): Promise<Blob> {
  const lines = code.split("\n");
  const scale = window.devicePixelRatio || 2;
  const fontSize = 16;
  const lineHeight = 26;
  const padding = 28;
  const headerHeight = language ? 34 : 0;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is unavailable.");
  }

  context.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
  const maxLineWidth = Math.max(
    ...lines.map((line) => context.measureText(line || " ").width),
    320,
  );
  const width = Math.ceil(maxLineWidth + padding * 2);
  const height = Math.ceil(
    padding * 2 + headerHeight + Math.max(lines.length, 1) * lineHeight,
  );

  canvas.width = width * scale;
  canvas.height = height * scale;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.scale(scale, scale);

  roundRect(context, 0, 0, width, height, 14);
  context.fillStyle = "#101820";
  context.fill();

  if (language) {
    context.fillStyle = "#8aa3b1";
    context.font = `600 13px Arial, sans-serif`;
    context.fillText(language, padding, 24);
  }

  context.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
  context.fillStyle = "#e6edf3";
  lines.forEach((line, index) => {
    context.fillText(
      line || " ",
      padding,
      padding + headerHeight + fontSize + index * lineHeight,
    );
  });

  return canvasToBlob(canvas);
}

async function renderSvgToPng(svg: string): Promise<Blob> {
  const image = new Image();
  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Unable to load SVG."));
      image.src = url;
    });

    const scale = window.devicePixelRatio || 2;
    const width = Math.max(image.naturalWidth || 720, 360);
    const height = Math.max(image.naturalHeight || 240, 180);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas is unavailable.");
    }

    canvas.width = width * scale;
    canvas.height = height * scale;
    context.scale(scale, scale);
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    return canvasToBlob(canvas);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Unable to render image."));
      }
    }, "image/png");
  });
}

function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}
