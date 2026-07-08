const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function buildDateRange(days = 28, now = new Date()) {
  const dayCount = Number(days);
  if (!Number.isInteger(dayCount) || dayCount < 1) {
    throw new Error("--days must be a positive integer");
  }

  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));
  const start = new Date(end);
  start.setUTCDate(end.getUTCDate() - dayCount + 1);

  return {
    startDate: toDateString(start),
    endDate: toDateString(end),
  };
}

export function parseDimensions(value) {
  if (!value || !String(value).trim()) {
    return ["date"];
  }

  return String(value)
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function toGscRequest({
  startDate,
  endDate,
  dimensions,
  rowLimit = 100,
  searchType = "web",
}) {
  assertDate(startDate, "startDate");
  assertDate(endDate, "endDate");

  return {
    startDate,
    endDate,
    dimensions,
    rowLimit: Number(rowLimit),
    searchType,
  };
}

export function formatRowsForConsole(rows = []) {
  if (!rows.length) {
    return "No rows returned.";
  }

  return rows
    .map((row, index) => {
      const keys = row.keys?.join(" | ") || "(total)";
      return [
        `${index + 1}. ${keys}`,
        `clicks=${row.clicks ?? 0}`,
        `impressions=${row.impressions ?? 0}`,
        `ctr=${formatPercent(row.ctr ?? 0)}`,
        `position=${formatNumber(row.position ?? 0, 1)}`,
      ].join("  ");
    })
    .join("\n");
}

function assertDate(value, name) {
  if (!DATE_RE.test(value)) {
    throw new Error(`${name} must be YYYY-MM-DD`);
  }
}

function toDateString(date) {
  return date.toISOString().slice(0, 10);
}

function formatPercent(value) {
  return `${(Number(value) * 100).toFixed(2)}%`;
}

function formatNumber(value, fractionDigits) {
  return Number(value).toFixed(fractionDigits);
}
