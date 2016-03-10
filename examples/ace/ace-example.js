///////////////////////////////////////////////////////////////////////////////
// Ace Editor Set Up
///////////////////////////////////////////////////////////////////////////////

var AceRange = ace.require('ace/range').Range;

var aceEditor = ace.edit("editor");
aceEditor.setReadOnly(true);
var aceSession = aceEditor.getSession();
var aceDocument = aceSession.getDocument();

aceSession.setMode("ace/mode/javascript");
aceEditor.setTheme("ace/theme/monokai");

var cursorManager = new AceMultiCursorManager(aceSession);
var selectionManager = new AceMultiSelectionManager(aceSession);


var usersList = document.getElementById("sessions");
var usernameSelect = document.getElementById("username");
var connectButton = document.getElementById("connectButton");
var disconnectButton = document.getElementById("disconnectButton");
var suppressEvents = false;

///////////////////////////////////////////////////////////////////////////////
// Convergence Set Up
///////////////////////////////////////////////////////////////////////////////

var model; // The RealTimeModel.
var rtString; // The RealTimeString that holds the text document
var localCursor; // The local cursor reference


// Connect to the domain.
ConvergenceDomain.debugFlags.protocol.messages = true;
var domain;

function connect() {
  var username = usernameSelect.options[usernameSelect.selectedIndex].value;
  domain = new ConvergenceDomain(connectionConfig.SERVER_URL + "/domain/namespace1/domain1");
  domain.on("connected", function () {
    connectButton.disabled = true;
    disconnectButton.disabled = false;
    usernameSelect.disabled = true;
  });

  // Now authenticate.  This is deferred unti connection is successful.
  domain.authenticateWithPassword(username, "password").then(function (username) {
    return domain.modelService().open("example", "ace-demo", function (collectionId, modelId) {
      return {
        "text": defaultText
      };
    });
  }).then(function (model) {
    bind(model);
  });
}

function disconnect() {
  domain.dispose();
  connectButton.disabled = false;
  disconnectButton.disabled = true;
  usernameSelect.disabled = false;

  aceEditor.removeAllListeners('change');
  aceSession.selection.removeAllListeners('changeCursor');
  aceSession.selection.removeAllListeners('changeSelection');

  suppressEvents = true;
  aceEditor.setValue("");
  suppressEvents = false;

  aceEditor.setReadOnly(true);

  Object.getOwnPropertyNames(users).forEach(function (sessionId) {
    removeUser(sessionId);
  });

  colorSeq = 0;
}

///////////////////////////////////////////////////////////////////////////////
// Two Way Binding from Quill to Convergence
///////////////////////////////////////////////////////////////////////////////


//
// Create a two way binding between Quill and Convergence.
//
function bind(realTimeModel) {
  aceEditor.setReadOnly(false);
  model = realTimeModel;

  model.connectedSessions().forEach(function (session) {
    addUser(session.userId, session.sessionId);
  });

  model.on("session_opened", function (e) {
    addUser(e.userId, e.sessionId);
  });

  model.on("session_closed", function (e) {
    removeUser(e.sessionId);
  });

  rtString = model.dataAt("text");

  // Initialize editor with current text.
  suppressEvents = true;
  aceDocument.setValue(rtString.value());
  suppressEvents = false;

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
    suppressEvents = true;
    aceDocument.setValue(e.value);
    suppressEvents = false;
  });

  // Create and publish a local cursor.
  localCursor = rtString.indexReference("cursor");
  localCursor.publish();

  // Create and publish a local cursor.
  localSelection = rtString.rangeReference("selection");
  localSelection.publish();

  // Listen for remote references.
  rtString.on("reference", function (e) {
    handleReference(e.reference);
  });

  function handleReference(reference) {
    if (reference.key() === "cursor") {
      handleRemoteCursorReference(reference);
    } else if (reference.key() === "selection") {
      handleRemoteSelectionReference(reference);
    }
  }

  // init current references
  var currentReferences = rtString.references();
  currentReferences.forEach(function (reference) {
    if (!reference.isLocal()) {
      handleReference(reference);
      if (reference.key() === "cursor" && reference.value() !== null) {
        cursorManager.setCursor(reference.sessionId(), reference.value());
      } else if (reference.key() === "selection" && reference.value() !== null) {
        selectionManager.setSelection(reference.sessionId(), toAceRange(reference.value()));
      }
    }
  });

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
  var color = users[reference.sessionId()].color;
  cursorManager.addCursor(
    reference.sessionId(),
    reference.userId(),
    color);

  // fixme should this be "set"
  reference.on("set", function (e) {
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
  var color = users[reference.sessionId()].color;
  selectionManager.addSelection(
    reference.sessionId(),
    reference.userId(),
    color);

  reference.on("set", function (e) {
    selectionManager.setSelection(reference.sessionId(), toAceRange(e.src.value()));
  });

  reference.on("cleared", function (e) {
    selectionManager.clearSelection(reference.sessionId());
  });

  reference.on("disposed", function (e) {
    selectionManager.removeSelection(reference.sessionId());
  });
}

function toAceRange(value) {
  var start = value.start;
  var end = value.end;

  if (start > end) {
    var temp = start;
    start = end;
    end = temp;
  }

  var selectionAchnor = aceDocument.indexToPosition(start, 0);
  var selectionLead = aceDocument.indexToPosition(end, 0);
  return new AceRange(selectionAchnor.row, selectionAchnor.column, selectionLead.row, selectionLead.column);
}

var users = {};
var colorSeq = 0;

function addUser(userId, sessionId) {
  var seq = colorSeq++;
  var color = USERS_COLORS[seq];
  users[sessionId] = {
    userId: userId,
    sessionId: sessionId,
    color: color
  };

  domain.userService().getUser(userId).then(function (user) {
    var userDiv = document.createElement("div");
    userDiv.innerHTML = user.username;
    userDiv.id = "user" + sessionId;
    userDiv.style.color = color;
    usersList.appendChild(userDiv);
  });

}

function removeUser(sessionId) {
  var user = document.getElementById("user" + sessionId);
  user.parentNode.removeChild(user)
  delete users[sessionId];
}

var defaultText = "function foo(items) {\n" +
  "  var x = \"All this is syntax highlighted\";\n" +
  "  return x; \n" +
  "}";
