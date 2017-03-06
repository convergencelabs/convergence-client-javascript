///////////////////////////////////////////////////////////////////////////////
// Quill Editor Set Up
///////////////////////////////////////////////////////////////////////////////
const quillEditor = new Quill('#quill-editor', {
  theme: 'snow'
});

///////////////////////////////////////////////////////////////////////////////
// Convergence Connection / Model Open
///////////////////////////////////////////////////////////////////////////////
Convergence.connectAnonymously(DOMAIN_URL).then(function (domain) {
  return domain.models().open("example", "quill-plain-text", function (collectionId, modelId) {
    return {"text": "test value"};
  });
}).then(bind);

///////////////////////////////////////////////////////////////////////////////
// Two Way Binding from Quill to Convergence
///////////////////////////////////////////////////////////////////////////////
function bind(model) {

  const rtString = model.elementAt("text");

  // Initialize editor with current text.
  quillEditor.setText(rtString.value());

  // bind to editing events and send them to the Quill API.
  rtString.on(Convergence.RealTimeString.Events.INSERT, function (e) {
    quillEditor.insertText(e.index, e.value);
  });

  rtString.on(Convergence.RealTimeString.Events.REMOVE, function (e) {
    quillEditor.deleteText(e.index, e.index + e.value.length);
  });

  rtString.on(Convergence.RealTimeString.Events.VALUE, function (e) {
    quillEditor.setText(e.element.value());
  });

  // Listen for text changes in the editor and pipe them into convergence
  quillEditor.on('text-change', function (delta, oldDelta, source) {
    //console.log(JSON.stringify(quillEditor.getContents()));
    if (source === 'user') {
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
          //rtString.remove(cursor, deltaOp.delete);
          cursor += deltaOp.delete;
        } else if (typeof deltaOp.insert === "string") {

          const attributes = deltaOp.attributes;
          const text = deltaOp.insert;

          const lines = text.split("\n");
          for(let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.length > 0) {
              console.log("Inserted: " + line + ", with style: " + JSON.stringify(attributes));
            }

            if (i < lines.length - 1) {
              console.log("Create new block");
            }
            // if (i === 0 && line.length === 0) {
            //   continue;
            // }
          }


          cursor += deltaOp.insert.length;
        }
      }
    }
  });
}
