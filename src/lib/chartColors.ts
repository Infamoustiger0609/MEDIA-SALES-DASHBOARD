// Validated categorical palette (light mode), fixed order — see dataviz skill.
export const CATEGORICAL = [
  "#2a78d6", // 1 blue
  "#eb6834", // 2 orange
  "#1baf7a", // 3 aqua
  "#eda100", // 4 yellow
  "#e87ba4", // 5 magenta
  "#008300", // 6 green
  "#4a3aa7", // 7 violet
  "#e34948", // 8 red
];

export const CHART_CHROME = {
  gridline: "#e7e0d1",
  axis: "#c9c2b0",
  mutedText: "#8a8071",
  secondaryText: "#4a4238",
};

export const STATUS = {
  good: "#0ca30c",
  warning: "#fab219",
  serious: "#ec835a",
  critical: "#d03b3b",
};

/**
 * PVR INOX brand accents -- chrome only (e.g. a tooltip's accent border).
 * Never assign these to a data series: CATEGORICAL above is the
 * colorblind-safe, order-dependent palette for that, and must stay as-is.
 */
export const BRAND_ACCENT = {
  gold: "#b8862e",
  terracotta: "#a3312a",
  charcoal: "#241f18",
  cream: "#fffdf9",
};

/**
 * Gold (actual) vs pale-tan (target/reference) -- a CATEGORICAL-adjacent
 * pair used ONLY for actual-vs-target chrome (e.g. the Overview trend
 * chart), per the design reference. Not part of CATEGORICAL and never used
 * to encode more than these two fixed roles.
 */
export const GOLD_SERIES = {
  actual: "#b8862e",
  target: "#d8cdb8",
};

/**
 * Gold-family tones for the Sales Quality segmented contribution bar --
 * identity encoding for a fixed 6-category set (SALES_QUALITY_KEYS), not a
 * magnitude/data-series palette, so it doesn't need to satisfy the
 * CATEGORICAL palette's colorblind-adjacency rules the same way. Order
 * matches SALES_QUALITY_KEYS.
 */
export const SALES_QUALITY_TONES = ["#b8862e", "#c9975f", "#8a5a1e", "#d6b370", "#a3312a", "#c96b4a"];
