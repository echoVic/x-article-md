import { type CodeImageTheme, THEME_GITHUB_LIGHT } from "./code-themes";

export async function copyCodeImage(code: string, language: string, theme?: CodeImageTheme): Promise<boolean> {
  const blob = await renderCodeToPng(code, language, theme);
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
  theme?: CodeImageTheme,
): Promise<void> {
  downloadBlob(await renderCodeToPng(code, language, theme), filename);
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
  theme: CodeImageTheme = THEME_GITHUB_LIGHT,
): Promise<Blob> {
  const lines = code.split("\n");
  const scale = window.devicePixelRatio || 2;
  const fontSize = 16;
  const lineHeight = 28;
  const cardPadding = 22;
  const panelPaddingX = 18;
  const lineNumberWidth = Math.max(
    34,
    String(lines.length || 1).length * 12 + 16,
  );
  const headerHeight = 42;
  const bodyPaddingY = 16;
  const topChromeHeight = 28;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is unavailable.");
  }

  context.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
  const maxLineWidth = Math.max(
    ...lines.map((line) => context.measureText(line || " ").width),
    360,
  );
  const panelWidth = Math.ceil(
    maxLineWidth + lineNumberWidth + panelPaddingX * 2 + 36,
  );
  const width = Math.ceil(Math.max(540, panelWidth + cardPadding * 2));
  const panelX = cardPadding;
  const panelY = cardPadding + topChromeHeight;
  const panelHeight =
    headerHeight + bodyPaddingY * 2 + Math.max(lines.length, 1) * lineHeight;
  const height = Math.ceil(panelY + panelHeight + cardPadding);

  canvas.width = width * scale;
  canvas.height = height * scale;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.scale(scale, scale);

  context.fillStyle = theme.cardBg;
  context.fillRect(0, 0, width, height);

  context.shadowColor = theme.shadowColor;
  context.shadowBlur = 18;
  context.shadowOffsetY = 6;
  roundRect(context, 0, 0, width, height, 14);
  context.fillStyle = theme.cardBg;
  context.fill();
  context.shadowColor = "transparent";
  context.shadowBlur = 0;
  context.shadowOffsetY = 0;

  context.strokeStyle = theme.borderColor;
  context.lineWidth = 1;
  roundRect(context, 0.5, 0.5, width - 1, height - 1, 14);
  context.stroke();

  drawCodeCardControls(context, width - cardPadding - 44, cardPadding + 1, theme.controlColor);

  roundRect(context, panelX, panelY, width - cardPadding * 2, panelHeight, 12);
  context.fillStyle = theme.panelBg;
  context.fill();
  context.strokeStyle = theme.borderColor;
  context.lineWidth = 1;
  context.stroke();

  context.save();
  roundRect(context, panelX, panelY, width - cardPadding * 2, headerHeight, 12);
  context.clip();
  context.fillStyle = theme.headerBg;
  context.fillRect(panelX, panelY, width - cardPadding * 2, headerHeight);
  context.restore();

  context.strokeStyle = theme.borderColor;
  context.beginPath();
  context.moveTo(panelX, panelY + headerHeight + 0.5);
  context.lineTo(width - cardPadding, panelY + headerHeight + 0.5);
  context.stroke();

  context.fillStyle = theme.labelColor;
  context.font = `600 14px Arial, sans-serif`;
  context.textBaseline = "middle";
  context.fillText(
    language || "plain text",
    panelX + panelPaddingX,
    panelY + headerHeight / 2,
  );
  drawCopyGlyph(context, width - cardPadding - panelPaddingX - 22, panelY + 11, theme.labelColor);

  context.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
  context.textBaseline = "alphabetic";
  lines.forEach((line, index) => {
    const baseline =
      panelY + headerHeight + bodyPaddingY + fontSize + index * lineHeight;
    context.fillStyle = theme.lineNumberColor;
    context.textAlign = "right";
    context.fillText(
      String(index + 1),
      panelX + panelPaddingX + lineNumberWidth - 14,
      baseline,
    );
    context.textAlign = "left";
    context.fillStyle = theme.textColor;
    context.fillText(
      line || " ",
      panelX + panelPaddingX + lineNumberWidth,
      baseline,
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

export async function renderMermaidToPng(code: string, theme?: CodeImageTheme): Promise<Blob> {
  const mermaid = (await import("mermaid")).default;
  const t = theme ?? THEME_GITHUB_LIGHT;
  const isDark = isThemeDark(t);
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "strict",
    theme: "base",
    themeVariables: {
      primaryColor: isDark ? lighten(t.cardBg, 0.12) : "#d9f3ea",
      primaryTextColor: t.textColor,
      primaryBorderColor: isDark ? t.borderColor : "#4aa384",
      lineColor: t.labelColor,
      secondaryColor: isDark ? t.headerBg : "#eef2f5",
      tertiaryColor: t.cardBg,
      fontFamily: "Arial, sans-serif",
      background: t.panelBg,
    },
  });

  const result = await mermaid.render(`ximg-${Date.now()}`, code);
  return renderSvgToPng(result.svg);
}

function isThemeDark(theme: CodeImageTheme): boolean {
  const hex = theme.cardBg.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

function lighten(hex: string, amount: number): string {
  const c = hex.replace("#", "");
  const r = Math.min(255, parseInt(c.slice(0, 2), 16) + Math.round(255 * amount));
  const g = Math.min(255, parseInt(c.slice(2, 4), 16) + Math.round(255 * amount));
  const b = Math.min(255, parseInt(c.slice(4, 6), 16) + Math.round(255 * amount));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
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

function drawCodeCardControls(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
) {
  context.strokeStyle = color;
  context.lineWidth = 1.8;
  context.lineCap = "round";
  context.lineJoin = "round";

  context.beginPath();
  context.moveTo(x + 2, y + 17);
  context.lineTo(x + 6, y + 17);
  context.lineTo(x + 18, y + 5);
  context.lineTo(x + 15, y + 2);
  context.lineTo(x + 3, y + 14);
  context.closePath();
  context.stroke();

  const closeX = x + 32;
  context.beginPath();
  context.moveTo(closeX, y + 4);
  context.lineTo(closeX + 12, y + 16);
  context.moveTo(closeX + 12, y + 4);
  context.lineTo(closeX, y + 16);
  context.stroke();
}

function drawCopyGlyph(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
) {
  context.strokeStyle = color;
  context.lineWidth = 1.7;
  context.lineJoin = "round";
  context.strokeRect(x + 5, y + 3, 12, 14);
  context.strokeRect(x + 1, y + 7, 12, 14);
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
