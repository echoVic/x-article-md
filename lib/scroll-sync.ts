export type SourceScrollPosition = { offset: number; atStart: boolean; atEnd: boolean };

/** Interpolate within parsed blocks rather than matching unequal pane percentages. */
export function previewScrollTop(
  position: SourceScrollPosition,
  sourceOffsets: number[],
  previewTops: number[],
  sourceLength: number,
  previewHeight: number,
  maxScroll: number,
): number {
  if (position.atStart || maxScroll <= 0 || !sourceOffsets.length || !previewTops.length) return 0;
  if (position.atEnd) return maxScroll;
  const count = Math.min(sourceOffsets.length, previewTops.length);
  let index = 0;
  while (index + 1 < count && sourceOffsets[index + 1] <= position.offset) index++;
  const start = sourceOffsets[index];
  const end = sourceOffsets[index + 1] ?? sourceLength;
  const ratio = Math.max(0, Math.min(1, (position.offset - start) / Math.max(1, end - start)));
  const nextTop = previewTops[index + 1] ?? previewHeight;
  return Math.max(0, Math.min(maxScroll, previewTops[index] + ratio * (nextTop - previewTops[index])));
}
