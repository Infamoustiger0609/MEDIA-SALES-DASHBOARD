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
  gridline: "#e1e0d9",
  axis: "#c3c2b7",
  mutedText: "#898781",
  secondaryText: "#52514e",
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
  gold: "#a9791f",
  terracotta: "#b2543a",
  charcoal: "#2a2622",
  cream: "#fbf7ef",
};
