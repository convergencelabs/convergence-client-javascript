import {EventEmitter} from "../../src/main/ts/util/EventEmitter";

class QuillAdapter {
  constructor(editor, quillDocElement) {
    this._editor = editor;
    this._quillDoc = quillDocElement;

    this._bind();
  }

  _bind() {

    // Initialize editor with current text.
    this._editor.setContents(this._quillDoc.getValue());

    // bind to editing events and send them to the Quill API.
    _model.on(QuillRichTextElement.Events.DELTA, (e) => {
      this._editor.updateContents(e.delta);
    });

    // Listen for text changes in the editor and pipe them into convergence
    quillEditor.on('text-change', (delta, oldDelta, source) => {
      if (source === 'user') {
        this._model.updateContents(delta);
      }
    });
  }
}


class QuillDocumentElement extends EventEmitter {
  static Events = {
    DELTA: "delta"
  };

  constructor(richTextDocument) {
    super();
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
        } else {
          console.log("advance cursor to: " + end);
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

          console.log(`Insert(${index}, ${JSON.stringify(line)}, ${JSON.stringify(attributes)})`);

          index += line.length;
        }

        cursor += deltaOp.insert.length;
      }
    }
  }
}