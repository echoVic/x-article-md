# MARKDOWN Atomic Entity Experiment

## Finding

`nevertoday/xposter` does not paste fenced code blocks as `<pre><code>`. It writes a marker block into the X Articles Draft.js editor, then replaces that marker with an atomic entity:

```js
{
  type: "atomic",
  entityType: "MARKDOWN",
  data: {
    markdown: "```ts\nconst readyToShip = true;\n```"
  },
  mutability: "MUTABLE"
}
```

This suggests X Articles has an internal atomic block renderer that may render fenced Markdown/code blocks better than clipboard HTML.

## Constraint

This project is currently a normal Next.js web page at `localhost`. It cannot directly access X's React fiber tree, Draft.js `editorState`, or X's editor `onChange` callback across origins. Testing `MARKDOWN` atomic entities therefore requires one of these execution surfaces:

- Chrome extension content script running on `https://x.com/*`.
- DevTools console snippet pasted into an open X Article editor.
- Browser automation that injects a script into the X page context.

## Probe Plan

1. Open `https://x.com/compose/articles` and create or open a draft.
2. Run `docs/experiments/markdown-atomic-probe.js` in the X page context.
3. Confirm the probe can find:
   - a contenteditable editor element,
   - a Draft.js state node,
   - a sample block and character metadata.
4. If reachable, insert one atomic `MARKDOWN` entity containing a fenced code block.
5. Review the X editor and Preview screen before publishing anything.

## Success Criteria

- X editor displays a code-like block rather than plain text.
- The block survives X preview.
- No marker text remains in the article.

## Product Implication

If the probe works reliably, the current app should not try to expose it directly as a web-only feature. The right product path would be an optional Chrome extension companion that takes the existing `toXArticleClipboard` output and writes it into X using the Draft.js bridge.
