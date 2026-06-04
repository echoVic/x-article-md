"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { EditorState, type Extension } from "@codemirror/state";
import { EditorView, keymap, lineNumbers } from "@codemirror/view";
import { markdown } from "@codemirror/lang-markdown";
import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import { syntaxHighlighting, defaultHighlightStyle } from "@codemirror/language";

type CodeMirrorEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (event: KeyboardEvent) => boolean;
  placeholder?: string;
};

export type CodeMirrorEditorHandle = {
  getSelection: () => { start: number; end: number; text: string };
  replaceSelection: (text: string) => void;
  focus: () => void;
  getValue: () => string;
  setValue: (value: string) => void;
};

export const CodeMirrorEditor = forwardRef<CodeMirrorEditorHandle, CodeMirrorEditorProps>(
  function CodeMirrorEditor({ value, onChange, onKeyDown, placeholder }, ref) {
    const editorRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);

    useImperativeHandle(ref, () => ({
      getSelection: () => {
        const view = viewRef.current;
        if (!view) {
          return { start: 0, end: 0, text: "" };
        }
        const { from, to } = view.state.selection.main;
        return {
          start: from,
          end: to,
          text: view.state.sliceDoc(from, to),
        };
      },
      replaceSelection: (text: string) => {
        const view = viewRef.current;
        if (!view) {
          return;
        }
        const { from, to } = view.state.selection.main;
        view.dispatch({
          changes: { from, to, insert: text },
          selection: { anchor: from + text.length },
        });
      },
      focus: () => {
        viewRef.current?.focus();
      },
      getValue: () => {
        return viewRef.current?.state.doc.toString() || "";
      },
      setValue: (newValue: string) => {
        const view = viewRef.current;
        if (!view) {
          return;
        }
        view.dispatch({
          changes: {
            from: 0,
            to: view.state.doc.length,
            insert: newValue,
          },
        });
      },
    }));

    useEffect(() => {
      if (!editorRef.current) {
        return;
      }

      const extensions: Extension[] = [
        lineNumbers(),
        markdown(),
        syntaxHighlighting(defaultHighlightStyle),
        keymap.of([...defaultKeymap, indentWithTab]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newValue = update.state.doc.toString();
            onChange(newValue);
          }
        }),
        EditorView.theme({
          "&": {
            height: "100%",
            fontSize: "13.5px",
            fontFamily:
              "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
          },
          ".cm-content": {
            padding: "14px 12px",
            caretColor: "var(--fg)",
            color: "var(--fg)",
            fontFamily: "inherit",
          },
          ".cm-line": {
            lineHeight: "1.714",
          },
          "&.cm-focused": {
            outline: "none",
          },
          ".cm-gutters": {
            backgroundColor: "var(--surface)",
            color: "color-mix(in oklch, var(--muted) 40%, transparent)",
            border: "none",
            borderRight: "1px solid var(--border)",
            fontSize: "12px",
            paddingRight: "12px",
            minWidth: "48px",
          },
          ".cm-gutterElement": {
            textAlign: "right",
            fontFamily: "ui-monospace, monospace",
            fontVariantNumeric: "tabular-nums",
          },
          ".cm-activeLineGutter": {
            backgroundColor: "transparent",
            color: "var(--muted)",
          },
          ".cm-activeLine": {
            backgroundColor:
              "color-mix(in oklch, var(--accent) 3%, transparent)",
          },
          ".cm-selectionBackground, ::selection": {
            backgroundColor: "var(--accent-soft) !important",
          },
          "&.cm-focused .cm-selectionBackground": {
            backgroundColor: "var(--accent-soft) !important",
          },
          ".cm-cursor": {
            borderLeftColor: "var(--accent)",
            borderLeftWidth: "2px",
          },
          // Markdown syntax highlighting
          ".cm-comment": {
            color: "var(--muted)",
            fontStyle: "italic",
          },
          ".cm-heading": {
            color: "var(--accent)",
            fontWeight: "600",
          },
          ".cm-strong": {
            color: "var(--fg)",
            fontWeight: "700",
          },
          ".cm-emphasis": {
            color: "var(--fg)",
            fontStyle: "italic",
          },
          ".cm-link": {
            color: "var(--accent)",
            textDecoration: "underline",
          },
          ".cm-url": {
            color: "color-mix(in oklch, var(--accent) 70%, transparent)",
          },
          ".cm-monospace": {
            color: "var(--accent)",
            backgroundColor: "var(--fg-soft)",
            padding: "2px 4px",
            borderRadius: "3px",
            fontSize: "0.95em",
            fontFamily: "inherit",
          },
          ".cm-quote": {
            color: "var(--muted)",
            fontStyle: "italic",
          },
        }),
        EditorState.tabSize.of(2),
        EditorView.lineWrapping,
      ];

      // Add placeholder if provided
      if (placeholder) {
        extensions.push(
          EditorView.domEventHandlers({
            focus: (event, view) => {
              const isEmpty = view.state.doc.length === 0;
              if (isEmpty) {
                view.contentDOM.setAttribute("data-placeholder", placeholder);
              }
            },
            blur: (event, view) => {
              view.contentDOM.removeAttribute("data-placeholder");
            },
          })
        );
      }

      // Add custom keydown handler if provided
      if (onKeyDown) {
        extensions.push(
          EditorView.domEventHandlers({
            keydown: (event, view) => {
              return onKeyDown(event);
            },
          })
        );
      }

      const startState = EditorState.create({
        doc: value,
        extensions,
      });

      const view = new EditorView({
        state: startState,
        parent: editorRef.current,
      });

      viewRef.current = view;

      return () => {
        view.destroy();
        viewRef.current = null;
      };
    }, []); // Only run once on mount

    // Update editor content when value prop changes externally
    useEffect(() => {
      const view = viewRef.current;
      if (!view) {
        return;
      }

      const currentValue = view.state.doc.toString();
      if (currentValue !== value) {
        view.dispatch({
          changes: {
            from: 0,
            to: currentValue.length,
            insert: value,
          },
        });
      }
    }, [value]);

    return (
      <div
        ref={editorRef}
        className="flex-1 overflow-hidden"
        style={{ height: "100%" }}
      />
    );
  }
);
