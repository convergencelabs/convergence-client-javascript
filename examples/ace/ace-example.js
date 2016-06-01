var aceExample = (function(ace, AceMultiCursorManager, AceMultiSelectionManager, ConvergenceDomain, connectionConfig) {

  ///////////////////////////////////////////////////////////////////////////////
  // Ace Selection Range Utilities
  ///////////////////////////////////////////////////////////////////////////////
  var AceRange = ace.require('ace/range').Range;

  function toAceRange(value, aceDocument) {
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

    var selectionAnchor = aceDocument.indexToPosition(start);
    var selectionLead = aceDocument.indexToPosition(end);
    return new AceRange(selectionAnchor.row, selectionAnchor.column, selectionLead.row, selectionLead.column);
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Global settings
  ///////////////////////////////////////////////////////////////////////////////
  ConvergenceDomain.debugFlags.protocol.messages = true;
  var suppressEvents = false;
  var defaultText = "function foo(items) {\n" +
                    "  var x = \"All this is syntax highlighted\";\n" +
                    "  return x; \n" +
                    "}";
  var users = {};

  ///////////////////////////////////////////////////////////////////////////////
  // Ace Editor Set Up
  ///////////////////////////////////////////////////////////////////////////////
  function Ace(ace) {
    this.editor = ace.edit("editor");
    this.editor.setReadOnly(true);
    this.session = this.editor.getSession();
    this.document = this.session.getDocument();

    this.session.setMode("ace/mode/javascript");
    this.editor.setTheme("ace/theme/monokai");

    this.cursorManager = new AceMultiCursorManager(this.session);
    this.selectionManager = new AceMultiSelectionManager(this.session);
  }
  Ace.prototype = {
    initialize: function(rtString) {
      this.editor.setReadOnly(false);

      // Initialize editor with current text.
      suppressEvents = true;
      this.document.setValue(rtString.value());
      suppressEvents = false;
    },
    onRemoteInsert: function(e) {
      suppressEvents = true;
      this.document.insert(this.document.indexToPosition(e.index), e.value);
      suppressEvents = false;
    },
    onRemoteDelete: function(e) {
      var start = this.document.indexToPosition(e.index);
      var end = this.document.indexToPosition(e.index + e.value.length);
      suppressEvents = true;
      this.document.remove(new AceRange(start.row, start.column, end.row, end.column));
      suppressEvents = false;
    },
    onRemoteAdd: function(e) {
      suppressEvents = true;
      this.document.setValue(e.value);
      suppressEvents = false;
    },
    reset: function() {
      this.editor.setValue("");
      this.editor.setReadOnly(true);
    }
  };

  ///////////////////////////////////////////////////////////////////////////////
  // Connection and User List
  ///////////////////////////////////////////////////////////////////////////////
  function AceExample() {
    
  }
  AceExample.prototype = {
    connect: function() {
      this.getDomElements();
      this.domain = new ConvergenceDomain(connectionConfig.SERVER_URL + "/domain/namespace1/domain1");
      this.domain.on("connected", function () {
        this.connectButton.disabled = true;
        this.disconnectButton.disabled = false;
        this.usernameSelect.disabled = true;
      }.bind(this));

      var username = this.usernameSelect.options[this.usernameSelect.selectedIndex].value;
      this.domain.authenticateWithPassword(username, "password").then(function (username) {
        return this.domain.modelService().open("example", "ace-demo", function (collectionId, modelId) {
          return {
            "text": defaultText
          };
        });
      }.bind(this)).then(function (model) {
        this.model = model;
        // The RealTimeString that holds the text document
        this.rtString = model.dataAt("text");

        this.ace = new Ace(ace);
        this.ace.initialize(this.rtString);

        this.createListeners(this.rtString);
      }.bind(this));
    },
    getDomElements: function() {
      this.usersList = document.getElementById("sessions");
      this.usernameSelect = document.getElementById("username");
      this.connectButton = document.getElementById("connectButton");
      this.disconnectButton = document.getElementById("disconnectButton");
    },
    ///////////////////////////////////////////////////////////////////////////////
    // Two Way Binding from Ace to Convergence
    ///////////////////////////////////////////////////////////////////////////////
    createListeners(rtString) {
      this.registerUserListeners();
      this.registerModelListeners();

      this.handleAceEditEvent = this.handleAceEditEvent.bind(this);
      this.ace.editor.on('change', this.handleAceEditEvent);

      // create ref object
      this.referenceHandler = new ReferenceHandler(rtString, this.ace);
    },
    registerUserListeners: function() {
      this.model.connectedSessions().forEach(function (session) {
        this.addUser(session.userId, session.sessionId);
      }.bind(this));

      this.model.on("session_opened", function (e) {
        this.addUser(e.userId, e.sessionId);
      }.bind(this));

      this.model.on("session_closed", function (e) {
        this.removeUser(e.sessionId);
      }.bind(this));
    },
    registerModelListeners: function() {
      this.rtString.on("insert", function (e) {
        this.ace.onRemoteInsert(e);
      }.bind(this));

      this.rtString.on("remove", function (e) {
        this.ace.onRemoteDelete(e);
      }.bind(this));

      this.rtString.on("value", function (e) {
        this.ace.onRemoteAdd(e);
      }.bind(this));
    },
    addUser: function(userId, sessionId) {
      var color = getConvergenceColor();
      users[sessionId] = {
        userId: userId,
        sessionId: sessionId,
        color: color
      };

      this.domain.identityService().getUser(userId).then(function (user) {
        var userDiv = document.createElement("div");
        userDiv.className = "session";
        userDiv.id = "user" + sessionId;

        var squareDiv = document.createElement("div");
        squareDiv.className = "userSquare";
        squareDiv.style.background = color;
        userDiv.appendChild(squareDiv);

        var usernameDiv = document.createElement("div");
        if(!user.firstName && !user.lastName) {
          usernameDiv.innerHTML = user.username;
        } else {
          usernameDiv.innerHTML = user.firstName + " " + user.lastName;
        }
        
        userDiv.appendChild(usernameDiv);

        this.usersList.appendChild(userDiv);
      }.bind(this));
    },
    removeUser: function(sessionId) {
      var user = document.getElementById("user" + sessionId);
      user.parentNode.removeChild(user);
      delete users[sessionId];
    },
    ///////////////////////////////////////////////////////////////////////////////
    // Outgoing events
    ///////////////////////////////////////////////////////////////////////////////
    handleAceEditEvent: function(delta) {
      if (suppressEvents) {
        return;
      }

      var pos = this.ace.document.positionToIndex(delta.start);
      switch (delta.action) {
        case "insert":
          this.rtString.insert(pos, delta.lines.join("\n"));
          break;
        case "remove":
          this.rtString.remove(pos, delta.lines.join("\n").length);
          break;
        default:
          throw new Error("unknown action: " + delta.action);
      }
    },
    disconnect: function() {
      this.domain.dispose();
      this.connectButton.disabled = false;
      this.disconnectButton.disabled = true;
      this.usernameSelect.disabled = false;

      this.ace.editor.off('change', this.handleAceEditEvent);

      this.referenceHandler.detach();

      this.ace.reset();

      this.ace.cursorManager.removeAll();
      this.ace.selectionManager.removeAll();

      Object.getOwnPropertyNames(users).forEach(function (sessionId) {
        this.removeUser(sessionId);
      }.bind(this));
    }
  };

  function ReferenceHandler(rtString, ace) {
    this.ace = ace;
    // Create and publish a local cursor.
    this.localCursor = rtString.indexReference("cursor");
    this.localCursor.publish();

    // Create and publish a local selection.
    this.localSelection = rtString.rangeReference("selection");
    this.localSelection.publish();

    this.initializeExistingReferences(rtString, ace);

    // Listen for remote references.
    rtString.on("reference", function (e) {
      this.handleReference(e.reference);
    }.bind(this));

    this.handleAceCursorChanged = this.handleAceCursorChanged.bind(this);
    this.handleAceSelectionChanged = this.handleAceSelectionChanged.bind(this);

    this.ace.session.selection.on('changeCursor', this.handleAceCursorChanged);
    this.ace.session.selection.on('changeSelection', this.handleAceSelectionChanged);
  }
  ReferenceHandler.prototype = {
    initializeExistingReferences: function(rtString) {
      rtString.references().forEach(function (reference) {
        if (!reference.isLocal()) {
          this.handleReference(reference);
          if (reference.key() === "cursor") {
            this.ace.cursorManager.setCursor(reference.sessionId(), reference.value());
          } else if (reference.key() === "selection" ) {
            this.ace.selectionManager.setSelection(reference.sessionId(), toAceRange(reference.value(), this.ace.document));
          }
        }
      }.bind(this));
    }, 
    ///////////////////////////////////////////////////////////////////////////////
    // Incoming events
    ///////////////////////////////////////////////////////////////////////////////
    handleReference: function(reference) {
      if (reference.key() === "cursor") {
        this.handleRemoteCursorReference(reference);
      } else if (reference.key() === "selection") {
        this.handleRemoteSelectionReference(reference);
      }
    },
    handleRemoteCursorReference: function(reference) {
      var color = users[reference.sessionId()].color;
      this.ace.cursorManager.addCursor(
        reference.sessionId(),
        reference.userId(),
        color);

      // fixme should this be "set"
      reference.on("set", function () {
        this.ace.cursorManager.setCursor(reference.sessionId(), reference.value());
      }.bind(this));

      reference.on("cleared", function () {
        this.ace.cursorManager.clearCursor(reference.sessionId());
      }.bind(this));

      reference.on("disposed", function () {
        this.ace.cursorManager.removeCursor(reference.sessionId());
      }.bind(this));
    },
    handleRemoteSelectionReference: function(reference) {
      var color = users[reference.sessionId()].color;
      this.ace.selectionManager.addSelection(
        reference.sessionId(),
        reference.userId(),
        color);

      reference.on("set", function (e) {
        this.ace.selectionManager.setSelection(reference.sessionId(), toAceRange(e.src.value(), this.ace.document));
      }.bind(this));

      reference.on("cleared", function () {
        this.ace.selectionManager.clearSelection(reference.sessionId());
      }.bind(this));

      reference.on("disposed", function () {
        this.ace.selectionManager.removeSelection(reference.sessionId());
      }.bind(this));
    },
    ///////////////////////////////////////////////////////////////////////////////
    // Outgoing events
    ///////////////////////////////////////////////////////////////////////////////
    handleAceCursorChanged: function() {
      if (!suppressEvents) {
        var pos = this.ace.document.positionToIndex(this.ace.editor.getCursorPosition());
        this.localCursor.set(pos);
      }
    },
    handleAceSelectionChanged: function() {
      if (!suppressEvents) {
        if (!this.ace.editor.selection.isEmpty()) {
          // todo ace has more complex seleciton capabilities beyond a single range.
          var start = this.ace.document.positionToIndex(this.ace.editor.selection.anchor);
          var end = this.ace.document.positionToIndex(this.ace.editor.selection.lead);
          this.localSelection.set({start: start, end: end});
        } else if (this.localSelection.isSet()) {
          this.localSelection.clear();
        }
      }
    },
    detach: function() {
      this.ace.session.selection.off('changeCursor', this.handleAceCursorChanged);
      this.ace.session.selection.off('changeSelection', this.handleAceSelectionChanged);
    }
  };

  return new AceExample();
}(ace, AceMultiCursorManager, AceMultiSelectionManager, ConvergenceDomain, connectionConfig));
