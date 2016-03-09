var AceRange = ace.require('ace/range').Range;

var aceEditor = ace.edit("editor");
var aceSession = aceEditor.getSession();
var aceDocument = aceSession.getDocument();

aceSession.setMode("ace/mode/javascript");
aceEditor.setTheme("ace/theme/monokai");

var cursorManager = new AceMultiCursorManager(aceSession);
var selectionManager = new AceMultiSelectionManager(aceSession);


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
  return domain.modelService().open("example", "ace-demo", function (collectionId, modelId) {
    return {
      "text": aceDocument.getValue()
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
  aceDocument.setValue(rtString.value());

  // bind to editing events and send them to the Quill API.
  rtString.on("insert", function (e) {
    suppressEvents = true;
    aceDocument.insert(aceDocument.indexToPosition(e.index), e.value);
    suppressEvents = false;
  });

  rtString.on("remove", function (e) {
    var start = aceDocument.indexToPosition(e.index);
    var end = aceDocument.indexToPosition(e.index + e.value.length);
    suppressEvents = true;
    aceDocument.remove(new AceRange(start.row, start.column, end.row, end.column));
    suppressEvents = false;
  });

  rtString.on("value", function (e) {
    aceDocument.setValue(e.value);
  });

  // Create and publish a local cursor.
  localCursor = rtString.indexReference("cursor");
  localCursor.publish();

  // Create and publish a local cursor.
  localSelection = rtString.rangeReference("selection");
  localSelection.publish();

  // Listen for remote references.
  rtString.on("reference", function (e) {
    if (e.reference.key() === "cursor") {
      handleRemoteCursorReference(e.reference);
    } else if (e.reference.key() === "selection") {
      handleRemoteSelectionReference(e.reference);
    }
  });

  var suppressEvents = false;
  aceEditor.on('change', function (e) {
    if (suppressEvents) {
      return;
    }
    convertDeltaToModelUpdate(e);
  });

  aceSession.selection.on('changeCursor', function (e) {
    // This event was generated in response to a remote operation.
    if (suppressEvents) {
      return;
    }
    var cursor2DPos = aceEditor.getCursorPosition();
    var pos = aceDocument.positionToIndex(cursor2DPos, 0);
    localCursor.set(pos);
  });

  aceSession.selection.on('changeSelection', function (e) {
    // This event was generated in response to a remote operation.
    if (suppressEvents) {
      return;
    }

    var selection = aceEditor.selection;
    var selectionAnchor = aceEditor.selection.anchor;
    var selectionLead = aceEditor.selection.lead;

    var start = 0;
    var end = 0;

    // Note: it seems that when you mouse out or cursor out of the selection
    // the last selection is still set, but isEmpty() will return true.  So
    // we only want to look at the selection if isEmpty() is false??
    if (!selection.isEmpty()) {
      start = aceDocument.positionToIndex(selectionAnchor, 0);
      end = aceDocument.positionToIndex(selectionLead, 0);
    }

    // FIXME Ace does more complex selections than just a continuous range.
    localSelection.set({start: start, end: end});
  });

  function convertDeltaToModelUpdate(delta) {
    var text;
    var pos = aceDocument.positionToIndex(delta.start, 0);

    switch (delta.action) {
      case 'insert':
        var insertText;
        if (delta.lines.length === 1) {
          insertText = delta.lines[0];
        } else {
          insertText = delta.lines.join("\n");
        }
        rtString.insert(pos, insertText);
        break;
      case 'remove':
        var removeText;
        if (delta.lines.length == 1) {
          removeText = delta.lines[0];
        }
        else {
          removeText = delta.lines.join("\n");
        }
        rtString.remove(pos, removeText.length);
        break;
      default:
        throw new Error("unknown action: " + delta.action);
    }
  }
}

function handleRemoteCursorReference(reference) {
  cursorManager.addCursor(
    reference.sessionId(),
    reference.userId(),
    'rgba(255,153,51,0.9)');

  // fixme should this be "set"
  reference.on("changed", function (e) {
    cursorManager.setCursor(reference.sessionId(), reference.value());
  });

  reference.on("cleared", function (e) {
    cursorManager.clearCursor(reference.sessionId());
  });

  reference.on("disposed", function (e) {
    cursorManager.removeCursor(reference.sessionId());
  });
}

function handleRemoteSelectionReference(reference) {
  selectionManager.addSelection(
    reference.sessionId(),
    reference.userId(),
    'rgba(255,153,51,0.9)');

  reference.on("changed", function (e) {
    var start = reference.value().start;
    var end = reference.value().end;

    if (start > end) {
      var temp = start;
      start = end;
      end = temp;
    }

    var selectionAchnor = aceDocument.indexToPosition(start, 0);
    var selectionLead = aceDocument.indexToPosition(end, 0);
    var range = new AceRange(selectionAchnor.row, selectionAchnor.column, selectionLead.row, selectionLead.column);
    selectionManager.setSelection(reference.sessionId(), range);
  });

  reference.on("cleared", function (e) {
    selectionManager.clearSelection(reference.sessionId());
  });

  reference.on("disposed", function (e) {
    cursorManager.removeSelection(reference.sessionId());
  });
}
