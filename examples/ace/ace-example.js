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

var suppressEvents = false;

///////////////////////////////////////////////////////////////////////////////
// Convergence Globals
///////////////////////////////////////////////////////////////////////////////
ConvergenceDomain.debugFlags.protocol.messages = true;
var domain;
var model; // The RealTimeModel.
var rtString; // The RealTimeString that holds the text document
var localCursor; // The local cursor reference

///////////////////////////////////////////////////////////////////////////////
// Two Way Binding from Ace to Convergence
///////////////////////////////////////////////////////////////////////////////
function initialize(realTimeModel) {
  aceEditor.setReadOnly(false);
  model = realTimeModel;

  rtString = model.dataAt("text");

  // Initialize editor with current text.
  suppressEvents = true;
  aceDocument.setValue(rtString.value());
  suppressEvents = false;

  registerUserListeners();
  registerModelListeners();

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

  initializeExistingReferences();
  registerAceListeners();
}

function registerUserListeners() {
  model.connectedSessions().forEach(function (session) {
    addUser(session.userId, session.sessionId);
  });

  model.on("session_opened", function (e) {
    addUser(e.userId, e.sessionId);
  });

  model.on("session_closed", function (e) {
    removeUser(e.sessionId);
  });
}

function registerModelListeners() {
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
}

function initializeExistingReferences() {
  rtString.references().forEach(function (reference) {
    if (!reference.isLocal()) {
      handleReference(reference);
      if (reference.key() === "cursor") {
        cursorManager.setCursor(reference.sessionId(), reference.value());
      } else if (reference.key() === "selection" ) {
        selectionManager.setSelection(reference.sessionId(), toAceRange(reference.value()));
      }
    }
  });
}

///////////////////////////////////////////////////////////////////////////////
// Outgoing events
///////////////////////////////////////////////////////////////////////////////

function registerAceListeners() {
  aceEditor.on('change', handleAceEditEvent);
  aceSession.selection.on('changeCursor', handleAceCursorChanged);
  aceSession.selection.on('changeSelection', handleAceSelectionChanged);
}

function handleAceCursorChanged(e) {
  if (!suppressEvents) {
    var pos = aceDocument.positionToIndex(aceEditor.getCursorPosition());
    localCursor.set(pos);
  }
}

function handleAceSelectionChanged(e) {
  if (!suppressEvents) {
    if (!aceEditor.selection.isEmpty()) {
      // todo ace has more complex seleciton capabilities beyond a single range.
      var start = aceDocument.positionToIndex(aceEditor.selection.anchor);
      var end = aceDocument.positionToIndex(aceEditor.selection.lead);
      localSelection.set({start: start, end: end});
    } else if (localSelection.isSet()) {
      localSelection.clear();
    }
  }
}

function handleAceEditEvent(delta) {
  if (!suppressEvents) {
    return;
  }

  var pos = aceDocument.positionToIndex(delta.start);
  switch (delta.action) {
    case "insert":
      rtString.insert(pos, delta.lines.join("\n"));
      break;
    case "remove":
      rtString.remove(pos, delta.lines.join("\n").length);
      break;
    default:
      throw new Error("unknown action: " + delta.action);
  }
}

///////////////////////////////////////////////////////////////////////////////
// Incoming events
///////////////////////////////////////////////////////////////////////////////

function handleReference(reference) {
  if (reference.key() === "cursor") {
    handleRemoteCursorReference(reference);
  } else if (reference.key() === "selection") {
    handleRemoteSelectionReference(reference);
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
  if (value === null || value === undefined) {
    return null;
  }

  var start = value.start;
  var end = value.end;

  if (start > end) {
    var temp = start;
    start = end;
    end = temp;
  }

  var selectionAchnor = aceDocument.indexToPosition(start);
  var selectionLead = aceDocument.indexToPosition(end);
  return new AceRange(selectionAchnor.row, selectionAchnor.column, selectionLead.row, selectionLead.column);
}

///////////////////////////////////////////////////////////////////////////////
// Connection and User List
///////////////////////////////////////////////////////////////////////////////
var usersList = document.getElementById("sessions");
var usernameSelect = document.getElementById("username");
var connectButton = document.getElementById("connectButton");
var disconnectButton = document.getElementById("disconnectButton");

var users = {};

function connect() {
  domain = new ConvergenceDomain(connectionConfig.SERVER_URL + "/domain/namespace1/domain1");
  domain.on("connected", function () {
    connectButton.disabled = true;
    disconnectButton.disabled = false;
    usernameSelect.disabled = true;
  });

  var username = usernameSelect.options[usernameSelect.selectedIndex].value;
  domain.authenticateWithPassword(username, "password").then(function (username) {
    return domain.modelService().open("example", "ace-demo", function (collectionId, modelId) {
      return {
        "text": defaultText
      };
    });
  }).then(function (model) {
    initialize(model);
  });
}

function disconnect() {
  domain.dispose();
  connectButton.disabled = false;
  disconnectButton.disabled = true;
  usernameSelect.disabled = false;

  aceEditor.off('change', handleAceEditEvent);
  aceSession.selection.off('changeCursor', handleAceCursorChanged);
  aceSession.selection.off('changeSelection', handleAceSelectionChanged);

  aceEditor.setValue("");
  aceEditor.setReadOnly(true);

  cursorManager.removeAll();
  selectionManager.removeAll();

  Object.getOwnPropertyNames(users).forEach(function (sessionId) {
    removeUser(sessionId);
  });
}

function addUser(userId, sessionId) {
  var color = getConvergenceColor();
  users[sessionId] = {
    userId: userId,
    sessionId: sessionId,
    color: color
  };

  domain.userService().getUser(userId).then(function (user) {
    var userDiv = document.createElement("div");
    userDiv.innerHTML = user.firstName + " " + user.lastName;
    userDiv.id = "user" + sessionId;
    userDiv.style.color = color;
    usersList.appendChild(userDiv);
  });

}

function removeUser(sessionId) {
  var user = document.getElementById("user" + sessionId);
  user.parentNode.removeChild(user);
  delete users[sessionId];
}

var defaultText = "function foo(items) {\n" +
  "  var x = \"All this is syntax highlighted\";\n" +
  "  return x; \n" +
  "}";
