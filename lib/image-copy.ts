export async function copyCodeImage(code: string, language: string): Promise<boolean> {
  const blob = await renderCodeToPng(code, language);
  return copyPngBlob(blob);
}

export async function copySvgImage(svg: string): Promise<boolean> {
  const blob = await renderSvgToPng(svg);
  return copyPngBlob(blob);
}

export async function downloadCodeImage(
  code: string,
  language: string,
  filename: string,
): Promise<void> {
  downloadBlob(await renderCodeToPng(code, language), filename);
}

export async function downloadSvgImage(svg: string, filename: string): Promise<void> {
  downloadBlob(await renderSvgToPng(svg), filename);
}

export async function copyTableImage(
  headers: string[],
  rows: string[][],
): Promise<boolean> {
  const blob = await renderTableToPng(headers, rows);
  return copyPngBlob(blob);
}

export async function downloadTableImage(
  headers: string[],
  rows: string[][],
  filename: string,
): Promise<void> {
  downloadBlob(await renderTableToPng(headers, rows), filename);
}

export async function copyPngBlob(blob: Blob): Promise<boolean> {
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

export async function renderCodeToPng(
  code: string,
  language: string,
): Promise<Blob> {
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

export async function renderSvgToPng(svg: string): Promise<Blob> {
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

export async function renderTableToPng(
  headers: string[],
  rows: string[][],
): Promise<Blob> {
  const scale = window.devicePixelRatio || 2;
  const padding = 28;
  const cellX = 18;
  const rowHeight = 48;
  const font = "15px Arial, sans-serif";
  const headerFont = "700 15px Arial, sans-serif";
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is unavailable.");
  }

  context.font = font;
  const columnCount = Math.max(headers.length, ...rows.map((row) => row.length), 1);
  const widths = Array.from({ length: columnCount }, (_, columnIndex) => {
    const values = [
      headers[columnIndex] ?? "",
      ...rows.map((row) => row[columnIndex] ?? ""),
    ];
    return Math.ceil(
      Math.max(...values.map((value) => context.measureText(value || " ").width)) +
        cellX * 2,
    );
  });
  const tableWidth = widths.reduce((sum, width) => sum + width, 0);
  const tableHeight = rowHeight * (rows.length + 1);
  const width = Math.max(360, tableWidth + padding * 2);
  const height = tableHeight + padding * 2;

  canvas.width = width * scale;
  canvas.height = height * scale;
  context.scale(scale, scale);

  context.fillStyle = "#ffffff";
  roundRect(context, 0, 0, width, height, 14);
  context.fill();
  context.strokeStyle = "#cfd9de";
  context.lineWidth = 1;
  context.stroke();

  let y = padding;
  drawTableRow(context, headers, widths, padding, y, rowHeight, headerFont, true);
  y += rowHeight;
  for (const row of rows) {
    drawTableRow(context, row, widths, padding, y, rowHeight, font, false);
    y += rowHeight;
  }

  return canvasToBlob(canvas);
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

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
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

function drawTableRow(
  context: CanvasRenderingContext2D,
  cells: string[],
  widths: number[],
  x: number,
  y: number,
  height: number,
  font: string,
  header: boolean,
) {
  let cursor = x;
  context.font = font;
  context.textBaseline = "middle";

  for (let index = 0; index < widths.length; index += 1) {
    const width = widths[index];
    context.fillStyle = header ? "#eef2f5" : "#ffffff";
    context.fillRect(cursor, y, width, height);
    context.strokeStyle = "#d8e0e5";
    context.strokeRect(cursor, y, width, height);
    context.fillStyle = "#0f1419";
    context.fillText(String(cells[index] ?? ""), cursor + 18, y + height / 2);
    cursor += width;
  }
}
