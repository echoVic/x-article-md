export type EditorState = {
  value: string;
  selectionStart: number;
  selectionEnd: number;
};

export type EditorUpdate = EditorState;

export type MarkdownAction =
  | "heading2"
  | "bold"
  | "inlineCode"
  | "link"
  | "bulletList"
  | "orderedList"
  | "codeFence"
  | "mermaid"
  | "table";

export function applyMarkdownAction(
  state: EditorState,
  action: MarkdownAction,
): EditorUpdate {
  switch (action) {
    case "heading2":
      return prefixSelectedLines(state, "## ");
    case "bold":
      return wrapSelection(state, "**", "**", "strong text");
    case "inlineCode":
      return wrapSelection(state, "`", "`", "inline code");
    case "link":
      return insertLink(state);
    case "bulletList":
      return prefixSelectedLines(state, "- ");
    case "orderedList":
      return prefixSelectedLines(state, "1. ");
    case "codeFence":
      return wrapBlock(state, "```ts\n", "\n```", "const ready = true;");
    case "mermaid":
      return wrapBlock(
        state,
        "```mermaid\n",
        "\n```",
        "graph TD\n  A[Draft] --> B[Preview]",
      );
    case "table":
      return replaceSelection(
        state,
        "| Name | Value |\n| --- | --- |\n| Item | Detail |",
      );
  }
}

export function handleMarkdownEnter(state: EditorState): EditorUpdate | null {
  if (state.selectionStart !== state.selectionEnd) {
    return null;
  }

  const line = currentLineBeforeCursor(state);
  const unordered = line.match(/^(\s*)[-*+]\s(.*)$/);
  if (unordered) {
    if (!unordered[2].trim()) {
      return replaceLineBeforeCursor(state, "");
    }

    return insertAtCursor(state, `\n${unordered[1]}- `);
  }

  const ordered = line.match(/^(\s*)(\d+)\.\s(.*)$/);
  if (ordered) {
    if (!ordered[3].trim()) {
      return replaceLineBeforeCursor(state, "");
    }

    return insertAtCursor(state, `\n${ordered[1]}${Number(ordered[2]) + 1}. `);
  }

  return null;
}

export function insertTab(state: EditorState): EditorUpdate {
  const lineStart = state.value.lastIndexOf("\n", state.selectionStart - 1) + 1;
  const selection = state.value.slice(state.selectionStart, state.selectionEnd);

  if (selection.includes("\n")) {
    const before = state.value.slice(0, lineStart);
    const selectedBlock = state.value.slice(lineStart, state.selectionEnd);
    const after = state.value.slice(state.selectionEnd);
    const indented = selectedBlock
      .split("\n")
      .map((line) => (line ? `  ${line}` : line))
      .join("\n");
    const added = indented.length - selectedBlock.length;

    return {
      value: `${before}${indented}${after}`,
      selectionStart: state.selectionStart + 2,
      selectionEnd: state.selectionEnd + added,
    };
  }

  return {
    value:
      state.value.slice(0, lineStart) +
      "  " +
      state.value.slice(lineStart),
    selectionStart: state.selectionStart + 2,
    selectionEnd: state.selectionEnd + 2,
  };
}

function wrapSelection(
  state: EditorState,
  before: string,
  after: string,
  fallback: string,
): EditorUpdate {
  const selected = selectedText(state) || fallback;
  const insert = `${before}${selected}${after}`;
  const update = replaceSelection(state, insert);
  const selectionStart = state.selectionStart + before.length;

  return {
    value: update.value,
    selectionStart,
    selectionEnd: selectionStart + selected.length,
  };
}

function wrapBlock(
  state: EditorState,
  before: string,
  after: string,
  fallback: string,
): EditorUpdate {
  const selected = selectedText(state) || fallback;
  const insert = `${before}${selected}${after}`;
  const update = replaceSelection(state, insert);
  const selectionStart = state.selectionStart + before.length;

  return {
    value: update.value,
    selectionStart,
    selectionEnd: selectionStart + selected.length,
  };
}

function insertLink(state: EditorState): EditorUpdate {
  const label = selectedText(state) || "link text";
  const insert = `[${label}](https://)`;
  const update = replaceSelection(state, insert);
  const urlStart = state.selectionStart + label.length + 3;

  return {
    value: update.value,
    selectionStart: urlStart,
    selectionEnd: urlStart + "https://".length,
  };
}

function prefixSelectedLines(state: EditorState, prefix: string): EditorUpdate {
  const lineStart = state.value.lastIndexOf("\n", state.selectionStart - 1) + 1;
  const selectionEnd =
    state.selectionEnd > state.selectionStart &&
    state.value[state.selectionEnd - 1] === "\n"
      ? state.selectionEnd - 1
      : state.selectionEnd;
  const lineEndIndex = state.value.indexOf("\n", selectionEnd);
  const lineEnd = lineEndIndex === -1 ? state.value.length : lineEndIndex;
  const before = state.value.slice(0, lineStart);
  const block = state.value.slice(lineStart, lineEnd);
  const after = state.value.slice(lineEnd);
  const prefixed = block
    .split("\n")
    .map((line) => {
      if (!line.trim()) {
        return line;
      }

      return line.startsWith(prefix) ? line.slice(prefix.length) : `${prefix}${line}`;
    })
    .join("\n");
  const delta = prefixed.length - block.length;

  return {
    value: `${before}${prefixed}${after}`,
    selectionStart: state.selectionStart + prefix.length,
    selectionEnd: state.selectionEnd + delta,
  };
}

function replaceSelection(state: EditorState, insert: string): EditorUpdate {
  return {
    value:
      state.value.slice(0, state.selectionStart) +
      insert +
      state.value.slice(state.selectionEnd),
    selectionStart: state.selectionStart + insert.length,
    selectionEnd: state.selectionStart + insert.length,
  };
}

function insertAtCursor(state: EditorState, insert: string): EditorUpdate {
  return replaceSelection(state, insert);
}

function selectedText(state: EditorState): string {
  return state.value.slice(state.selectionStart, state.selectionEnd);
}

function currentLineBeforeCursor(state: EditorState): string {
  const lineStart = state.value.lastIndexOf("\n", state.selectionStart - 1) + 1;
  return state.value.slice(lineStart, state.selectionStart);
}

function replaceLineBeforeCursor(
  state: EditorState,
  replacement: string,
): EditorUpdate {
  const lineStart = state.value.lastIndexOf("\n", state.selectionStart - 1) + 1;
  const value =
    state.value.slice(0, lineStart) +
    replacement +
    state.value.slice(state.selectionStart);
  const cursor = lineStart + replacement.length;

  return {
    value,
    selectionStart: cursor,
    selectionEnd: cursor,
  };
}
