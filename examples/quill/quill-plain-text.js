///////////////////////////////////////////////////////////////////////////////
// Quill Editor Set Up
///////////////////////////////////////////////////////////////////////////////

// Initialize editor with custom theme and modules
var quillEditor = new Quill('#quill-editor', {
  modules: {
    'multi-cursor': true
  },
  theme: 'snow',
  formats: []
});

// Create a cursor manager for showing remote cursors
var cursorManager = quillEditor.getModule('multi-cursor');

///////////////////////////////////////////////////////////////////////////////
// Convergence Set Up
///////////////////////////////////////////////////////////////////////////////

var model; // The RealTimeModel.
var rtString; // The RealTimeString that holds the text document
var localCursor; // The local cursor reference

// Connect to the domain.
ConvergenceDomain.debugFlags.protocol.messages = true;
var domain = new ConvergenceDomain(connectionConfig.SERVER_URL + "/domain/namespace1/domain1");
domain.on("connected", function () {
  console.log("connected");
});

// Now authenticate.  This is deferred unti connection is successful.
domain.authenticateWithPassword("test1", "password").then(function (username) {
  return domain.modelService().open("example", "quill-plain-text", function (collectionId, modelId) {
    return {
      "text": "test value"
    };
  });
}).then(function (model) {
  bind(model);
});

///////////////////////////////////////////////////////////////////////////////
// Two Way Binding from Quill to Convergence
///////////////////////////////////////////////////////////////////////////////

//
// Create a two way binding between Quill and Convergence.
//
function bind(realTimeModel) {
  model = realTimeModel;
  rtString = model.dataAt("text");

  // Initialize editor with current text.
  quillEditor.setText(rtString.value());

  // bind to editing events and send them to the Quill API.
  rtString.on("insert", function (e) {
    quillEditor.insertText(e.index, e.value);
  });

  rtString.on("remove", function (e) {
    quillEditor.deleteText(e.index, e.index + e.value.length);
  });

  rtString.on("value", function (e) {
    quillEditor.setText(e.value);
  });

  // Create and publish a local cursor.
  localCursor = rtString.indexReference("cursor");
  localCursor.publish();

  // Listen for remote references.
  rtString.on("reference", function (e) {
    if (e.reference.key() === "cursor") {
      handleRemoteCursorReference(e.reference);
    }
  });

  // Listen for text changes in the editor and pipe them into convergence
  quillEditor.on('text-change', function (delta, source) {
    if (source === 'user') {
      var deltaOps = delta.ops;
      var cursor = 0;
      for (var i = 0; i < deltaOps.length; i++) {
        var deltaOp = deltaOps[i];
        if (typeof deltaOp.retain === "number") {
          cursor += deltaOp.retain;
        } else if (typeof deltaOp.delete === "number") {
          rtString.remove(cursor, deltaOp.delete);
          cursor += deltaOp.delete;
        } else if (typeof deltaOp.insert === "string") {
          rtString.insert(cursor, deltaOp.insert);
          cursor += deltaOp.insert.length;
        }
      }
    }
  });

  // Handle cursor and selection changes.
  quillEditor.on('selection-change', function (range) {
    if (range) {
      localCursor.set(range.end);
    } else {
      console.log('Cursor not in the editor');
    }
  });
}

function handleRemoteCursorReference(reference) {
  reference.on("set", function (e) {
    cursorManager.setCursor(
      reference.sessionId(),
      reference.value(),
      reference.userId(),
      'rgba(255,153,51,0.9)');
  });

  reference.on("cleared", function (e) {
    cursorManager.removeCursor(reference.sessionId());
  });

  reference.on("disposed", function (e) {
    cursorManager.removeCursor(reference.sessionId());
  });
}
