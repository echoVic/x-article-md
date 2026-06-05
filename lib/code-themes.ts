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
  cardBg: "#ffffff",
  panelBg: "#f7f9fa",
  headerBg: "#eff3f4",
  textColor: "#0f1419",
  lineNumberColor: "#f58b23",
  borderColor: "#d8e0e5",
  labelColor: "#536471",
  controlColor: "#8a99a3",
  shadowColor: "rgba(15, 20, 25, 0.10)",
};

export const THEME_GITHUB_DARK: CodeImageTheme = {
  id: "github-dark",
  name: "GitHub Dark",
  cardBg: "#0d1117",
  panelBg: "#161b22",
  headerBg: "#1c2128",
  textColor: "#e6edf3",
  lineNumberColor: "#f0883e",
  borderColor: "#30363d",
  labelColor: "#8b949e",
  controlColor: "#484f58",
  shadowColor: "rgba(0, 0, 0, 0.30)",
};

export const THEME_DRACULA: CodeImageTheme = {
  id: "dracula",
  name: "Dracula",
  cardBg: "#282a36",
  panelBg: "#1e1f29",
  headerBg: "#2d2f3d",
  textColor: "#f8f8f2",
  lineNumberColor: "#6272a4",
  borderColor: "#44475a",
  labelColor: "#6272a4",
  controlColor: "#44475a",
  shadowColor: "rgba(0, 0, 0, 0.35)",
};

export const THEME_NORD: CodeImageTheme = {
  id: "nord",
  name: "Nord",
  cardBg: "#2e3440",
  panelBg: "#272c36",
  headerBg: "#353b49",
  textColor: "#d8dee9",
  lineNumberColor: "#4c566a",
  borderColor: "#3b4252",
  labelColor: "#616e88",
  controlColor: "#4c566a",
  shadowColor: "rgba(0, 0, 0, 0.30)",
};

export const THEME_NIGHT_OWL: CodeImageTheme = {
  id: "night-owl",
  name: "Night Owl",
  cardBg: "#011627",
  panelBg: "#001424",
  headerBg: "#0b2942",
  textColor: "#d6deeb",
  lineNumberColor: "#4b6479",
  borderColor: "#122d42",
  labelColor: "#5f7e97",
  controlColor: "#3b5468",
  shadowColor: "rgba(0, 0, 0, 0.40)",
};

export const THEME_SOLARIZED_DARK: CodeImageTheme = {
  id: "solarized-dark",
  name: "Solarized Dark",
  cardBg: "#002b36",
  panelBg: "#00242e",
  headerBg: "#073642",
  textColor: "#839496",
  lineNumberColor: "#586e75",
  borderColor: "#073642",
  labelColor: "#657b83",
  controlColor: "#586e75",
  shadowColor: "rgba(0, 0, 0, 0.35)",
};

export const THEME_MONOKAI: CodeImageTheme = {
  id: "monokai",
  name: "Monokai",
  cardBg: "#272822",
  panelBg: "#1e1f1c",
  headerBg: "#2d2e2a",
  textColor: "#f8f8f2",
  lineNumberColor: "#a6e22e",
  borderColor: "#3e3f3a",
  labelColor: "#75715e",
  controlColor: "#5a5b56",
  shadowColor: "rgba(0, 0, 0, 0.35)",
};

export const THEME_TOKYO_NIGHT: CodeImageTheme = {
  id: "tokyo-night",
  name: "Tokyo Night",
  cardBg: "#1a1b26",
  panelBg: "#16161e",
  headerBg: "#1f2335",
  textColor: "#a9b1d6",
  lineNumberColor: "#3b4261",
  borderColor: "#292e42",
  labelColor: "#565f89",
  controlColor: "#3b4261",
  shadowColor: "rgba(0, 0, 0, 0.40)",
};

export const CODE_THEMES: CodeImageTheme[] = [
  THEME_GITHUB_LIGHT,
  THEME_GITHUB_DARK,
  THEME_DRACULA,
  THEME_NORD,
  THEME_NIGHT_OWL,
  THEME_SOLARIZED_DARK,
  THEME_MONOKAI,
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
