// References to the buttons that will be enabled / disabled
var openButton = document.getElementById("openButton");
var closeButton = document.getElementById("closeButton");
var joinButton = document.getElementById("joinButton");
var leaveButton = document.getElementById("leaveButton");

// The element that shows the local moust location
var localMouseSpan = document.getElementById("localMouse");

// The list where all the cursors by session are listed.
var sessionsUl = document.getElementById("sessions");

// The div where the mouse events are sourced / rendered
var cursorBox = document.getElementById('cursorBox');

// The Convergence activity
var activity;

// A map of remote cursors by sessionId
var remoteSessions = {};


// Connect to the domain.
ConvergenceDomain.debugFlags.protocol.messages = true;
var domain = new ConvergenceDomain(connectionConfig.SERVER_URL + "/domain/namespace1/domain1");
domain.on("connected", function () {
  console.log("connected");
});

// Now authenticate.  This is deferred until connection is successful.
domain.authenticateWithPassword("test1", "password").then(function (username) {
  openButton.disabled = false;
});

var zOrder = 1;

// Handles clicking the open button
function openActivity() {
  domain.activityService().open("testActivity").then(function (opened) {
    activity = opened;
    openButton.disabled = true;
    closeButton.disabled = false;
    joinButton.disabled = false;

    activity.joinedSessions().forEach(function (session) {
      handleSessionJoined(session.userId, session.sessionId, session.sessionId === activity.session().sessionId());
    });

    activity.on("session_joined", function (event) {
      handleSessionJoined(event.userId, event.sessionId, event.local);
    });

    activity.on("session_left", function (event) {
      handleSessionLeft(event.sessionId);
    });

    activity.state().on("state_set", function (event) {
      handleStateSet(event);
    });
  });
}

// Handles clicking the close button
function closeActivity() {
  activity.close().then(function () {
    openButton.disabled = false;
    closeButton.disabled = true;
    joinButton.disabled = true;
    leaveButton.disabled = true;
  });
}

// Handles clicking the join button
function joinActivity() {
  activity.join().then(function () {
    joinButton.disabled = true;
    leaveButton.disabled = false;
  });
}

// Handles clicking the leave button
function leaveActivity() {
  activity.leave().then(function () {
    joinButton.disabled = false;
    leaveButton.disabled = true;
  });
}


// Handles a session joining (both remote and local)
function handleSessionJoined(userId, sessionId, local) {
  var sessionLi = document.createElement("li");
  var sessionLabel = document.createElement("span");
  sessionLabel.innerHTML = userId + "(" + sessionId + "): ";
  sessionLi.appendChild(sessionLabel);

  var locationLabel = document.createElement("span");
  sessionLi.appendChild(locationLabel);

  sessionsUl.appendChild(sessionLi);
  var cursorDiv;

  if (!local) {
    cursorDiv = document.createElement("img");
    cursorDiv.src = "cursor.png";
    cursorDiv.className = "remoteCursor";
    cursorDiv.zOrder = zOrder++;
    cursorBox.appendChild(cursorDiv);
  }

  remoteSessions[sessionId] = {
    sessionLi: sessionLi,
    locationLabel: locationLabel,
    cursorDiv: cursorDiv
  }
}

// Handles a session leaving (both remote and local)
function handleSessionLeft(sessionId) {
  var sessionRec = remoteSessions[sessionId];
  sessionRec.sessionLi.parentNode.removeChild(sessionRec.sessionLi);
  if (sessionRec.cursorDiv) {
    cursorBox.removeChild(sessionRec.cursorDiv);
  }
}

// Handles the state set event, rendering the current information
function handleStateSet(event) {
  var sessionRec = remoteSessions[event.sessionId];
  sessionRec.locationLabel.innerHTML = "(" + event.value.x + "," + event.value.y + ")"
  if (!event.local) {
    sessionRec.cursorDiv.style.top = event.value.y + "px";
    sessionRec.cursorDiv.style.left = event.value.x + "px";
  }
}

// handles the local mouse movement and set events.
function mouseMoved(evt) {
  var cursorBoxOffset = $(cursorBox).offset();
  var x = evt.pageX - cursorBoxOffset.left;
  var y = evt.pageY - cursorBoxOffset.top;
  localMouseSpan.innerHTML = " (" + x + "," + y + ")";

  if (activity && activity.joined()) {
    activity.state().set("pointer", {x: x, y: y});
  }
}
