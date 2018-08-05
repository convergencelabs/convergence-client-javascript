class QuillAdapter {
  constructor(editor, quillDoc) {
    this._editor = editor;
    this._quillDoc = quillDoc;

    this._bind();
  }

  _bind() {
    this._editor.setContents(this._quillDoc.getValue());

    // bind to editing events and send them to the Quill API.
    this._quillDoc.on("delta", (e) => {
      this._editor.updateContents(e.delta);
    });

    // Listen for text changes in the editor and pipe them into convergence
    this._editor.on('text-change', (delta, oldDelta, source) => {
      if (source === 'user') {
        this._quillDoc.updateContents(delta);
      }
      console.log(this._editor.getContents());
    });
  }
}
