export type CodeImageTheme = {
  id: string;
  name: string;
  cardBg: string;
  panelBg: string;
  headerBg: string;
  textColor: string;
  lineNumberColor: string;
  borderColor: string;
  labelColor: string;
  controlColor: string;
  shadowColor: string;
};

export const THEME_GITHUB_LIGHT: CodeImageTheme = {
  id: "github-light",
  name: "GitHub Light",
  cardBg: "#f6f8fa",
  panelBg: "#ffffff",
  headerBg: "#f6f8fa",
  textColor: "#1f2328",
  lineNumberColor: "#6e7681",
  borderColor: "#d0d7de",
  labelColor: "#656d76",
  controlColor: "#8c959f",
  shadowColor: "rgba(31, 35, 40, 0.08)",
};

export const THEME_GITHUB_DARK: CodeImageTheme = {
  id: "github-dark",
  name: "GitHub Dark",
  cardBg: "#010409",
  panelBg: "#0d1117",
  headerBg: "#010409",
  textColor: "#e6edf3",
  lineNumberColor: "#6e7681",
  borderColor: "#30363d",
  labelColor: "#8b949e",
  controlColor: "#484f58",
  shadowColor: "rgba(0, 0, 0, 0.30)",
};

export const THEME_DRACULA: CodeImageTheme = {
  id: "dracula",
  name: "Dracula",
  cardBg: "#21222c",
  panelBg: "#282a36",
  headerBg: "#191a21",
  textColor: "#f8f8f2",
  lineNumberColor: "#6272a4",
  borderColor: "#44475a",
  labelColor: "#f8f8f2",
  controlColor: "#6272a4",
  shadowColor: "rgba(0, 0, 0, 0.35)",
};

export const THEME_NORD: CodeImageTheme = {
  id: "nord",
  name: "Nord",
  cardBg: "#2e3440",
  panelBg: "#2e3440",
  headerBg: "#3b4252",
  textColor: "#d8dee9",
  lineNumberColor: "#4c566a",
  borderColor: "#3b4252",
  labelColor: "#d8dee9",
  controlColor: "#4c566a",
  shadowColor: "rgba(0, 0, 0, 0.25)",
};

export const THEME_NIGHT_OWL: CodeImageTheme = {
  id: "night-owl",
  name: "Night Owl",
  cardBg: "#011627",
  panelBg: "#011627",
  headerBg: "#0b2942",
  textColor: "#d6deeb",
  lineNumberColor: "#4b6479",
  borderColor: "#5f7e97",
  labelColor: "#d2dee7",
  controlColor: "#5f7e97",
  shadowColor: "rgba(0, 0, 0, 0.40)",
};

export const THEME_SOLARIZED_DARK: CodeImageTheme = {
  id: "solarized-dark",
  name: "Solarized Dark",
  cardBg: "#073642",
  panelBg: "#002b36",
  headerBg: "#073642",
  textColor: "#839496",
  lineNumberColor: "#586e75",
  borderColor: "#586e75",
  labelColor: "#93a1a1",
  controlColor: "#586e75",
  shadowColor: "rgba(0, 0, 0, 0.30)",
};

export const THEME_ONE_MONOKAI: CodeImageTheme = {
  id: "one-monokai",
  name: "One Monokai",
  cardBg: "#21252b",
  panelBg: "#282c34",
  headerBg: "#21252b",
  textColor: "#abb2bf",
  lineNumberColor: "#495162",
  borderColor: "#181a1f",
  labelColor: "#9da5b4",
  controlColor: "#495162",
  shadowColor: "rgba(0, 0, 0, 0.35)",
};

export const THEME_TOKYO_NIGHT: CodeImageTheme = {
  id: "tokyo-night",
  name: "Tokyo Night",
  cardBg: "#16161e",
  panelBg: "#1a1b26",
  headerBg: "#16161e",
  textColor: "#a9b1d6",
  lineNumberColor: "#363b54",
  borderColor: "#101014",
  labelColor: "#a9b1d6",
  controlColor: "#363b54",
  shadowColor: "rgba(0, 0, 0, 0.40)",
};

export const THEME_ONE_DARK_PRO: CodeImageTheme = {
  id: "one-dark-pro",
  name: "One Dark Pro",
  cardBg: "#21252b",
  panelBg: "#282c34",
  headerBg: "#21252b",
  textColor: "#abb2bf",
  lineNumberColor: "#495162",
  borderColor: "#3e4452",
  labelColor: "#abb2bf",
  controlColor: "#4b5263",
  shadowColor: "rgba(0, 0, 0, 0.30)",
};

export const CODE_THEMES: CodeImageTheme[] = [
  THEME_GITHUB_LIGHT,
  THEME_GITHUB_DARK,
  THEME_ONE_DARK_PRO,
  THEME_DRACULA,
  THEME_NORD,
  THEME_NIGHT_OWL,
  THEME_SOLARIZED_DARK,
  THEME_ONE_MONOKAI,
  THEME_TOKYO_NIGHT,
];

export function getDefaultThemeId(isDark: boolean): string {
  return isDark ? "dracula" : "github-light";
}

export function resolveTheme(id: string, isDark: boolean): CodeImageTheme {
  if (id === "auto") {
    const defaultId = getDefaultThemeId(isDark);
    return CODE_THEMES.find((t) => t.id === defaultId) ?? THEME_GITHUB_LIGHT;
  }
  return CODE_THEMES.find((t) => t.id === id) ?? THEME_GITHUB_LIGHT;
}
