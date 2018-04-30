class QuillAdapter {
  constructor(editor, quillDocElement) {
    this._editor = editor;
    this._quillDoc = quillDocElement;

    this._bind();
  }

  _bind() {
    this._editor.setContents(this._quillDoc.getValue());

    // // bind to editing events and send them to the Quill API.
    // this._quillDoc.on("delta", (e) => {
    //   this._editor.updateContents(e.delta);
    // });

    // Listen for text changes in the editor and pipe them into convergence
    this._editor.on('text-change', (delta, oldDelta, source) => {
      if (source === 'user') {
        this._quillDoc.updateContents(delta);
      }
      console.log(this._editor.getContents());
    });
  }
}


class QuillDocumentElement {

  constructor(richTextDocument) {
    this._richTextDoc = richTextDocument;
  }

  getValue() {

  }

  setValue(delta) {

  }

  updateContents(delta) {
    const deltaOps = delta.ops;
    let cursor = 0;
    for (let i = 0; i < deltaOps.length; i++) {
      const deltaOp = deltaOps[i];
      //console.log(deltaOp);
      if (typeof deltaOp.retain === "number") {
        const end = cursor + deltaOp.retain;
        if (deltaOp.attributes !== undefined) {
          console.log("Change style from: " + cursor + " to: " + end, deltaOp.attributes);
        }
        cursor += deltaOp.retain;
      } else if (typeof deltaOp.delete === "number") {
        const index = cursor;
        const length = deltaOp.delete;
        console.log(`Delete(${index}, ${length})`);

        cursor += deltaOp.delete;
      } else if (typeof deltaOp.insert === "string") {
        let index = cursor;
        const attributes = deltaOp.attributes;
        const text = deltaOp.insert;

        const lines = text.split("\n");
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line.length > 0) {
            console.log(`Insert(${index}, ${line}, ${JSON.stringify(attributes)})`);

          }

          if (i < lines.length - 1) {
            console.log(`Insert(${index}, ${line}, ${JSON.stringify(attributes)})`);
          }

          index += line.length;
        }

        cursor += deltaOp.insert.length;
      }
    }
  }
}