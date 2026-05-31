(() => {
  const editorSelector =
    "[data-contents='true'] [contenteditable='true'], [contenteditable='true'][role='textbox'], [contenteditable='true'].public-DraftEditor-content, [contenteditable='true']";

  function findEditorElement() {
    for (const element of document.querySelectorAll(editorSelector)) {
      const rect = element.getBoundingClientRect();
      if (rect.width > 200 && rect.height > 80) return element;
    }
    return null;
  }

  function findDraftStateNode() {
    const editor = findEditorElement();
    if (!editor) return null;
    const fiberKey = Object.keys(editor).find(
      (key) =>
        key.startsWith("__reactFiber$") ||
        key.startsWith("__reactInternalInstance$"),
    );
    if (!fiberKey) return null;
    let fiber = editor[fiberKey];
    for (let depth = 0; depth < 80 && fiber; depth += 1) {
      const stateNode = fiber.stateNode;
      if (stateNode?.props?.editorState && typeof stateNode.props.onChange === "function") {
        return stateNode;
      }
      fiber = fiber.return;
    }
    return null;
  }

  function firstCharacterMetadata(block) {
    const list = block?.getCharacterList?.();
    if (!list) return null;
    const size =
      typeof list.size === "number"
        ? list.size
        : typeof list.count === "function"
          ? list.count()
          : 0;
    for (let index = 0; index < size; index += 1) {
      const character = list.get?.(index);
      if (character?.set) return character;
    }
    return null;
  }

  function findSampleBlock(draftNode) {
    let sample = null;
    draftNode?.props?.editorState
      ?.getCurrentContent()
      ?.getBlockMap()
      ?.forEach((block) => {
        if (!sample && firstCharacterMetadata(block)) sample = block;
      });
    return sample;
  }

  function insertMarkdownAtomic(markdown) {
    const draftNode = findDraftStateNode();
    if (!draftNode) return { ok: false, error: "Draft.js state node not found" };

    const editorState = draftNode.props.editorState;
    const EditorState = editorState.constructor;
    const SelectionState = editorState.getSelection().constructor;
    let contentState = editorState.getCurrentContent();
    const blockMap = contentState.getBlockMap();
    const sampleBlock = findSampleBlock(draftNode);
    const sampleCharacter = firstCharacterMetadata(sampleBlock);
    if (!sampleBlock || !sampleCharacter?.set) {
      return { ok: false, error: "Draft.js sample block not found" };
    }

    contentState = contentState.createEntity(
      "MARKDOWN",
      "MUTABLE",
      { markdown },
    );
    const entityKey = contentState.getLastCreatedEntityKey();
    const CharacterList = sampleBlock.getCharacterList().constructor;
    const key = Math.random().toString(36).slice(2, 7);
    const atomicBlock = sampleBlock.merge({
      key,
      type: "atomic",
      text: " ",
      characterList: CharacterList([sampleCharacter.set("entity", entityKey)]),
      depth: 0,
    });
    const nextBlockMap = blockMap.set(key, atomicBlock);
    const selection = SelectionState.createEmpty(key);
    const nextContent = contentState
      .set("blockMap", nextBlockMap)
      .set("selectionBefore", selection)
      .set("selectionAfter", selection);
    const nextEditorState = EditorState.moveSelectionToEnd(
      EditorState.push(editorState, nextContent, "insert-fragment"),
    );
    draftNode.props.onChange(nextEditorState);
    return { ok: true };
  }

  const markdown = "```ts\nconst readyToShip = true;\n```";
  console.log("[x-article-md probe]", insertMarkdownAtomic(markdown));
})();
