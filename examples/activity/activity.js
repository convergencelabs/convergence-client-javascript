var openButton = document.getElementById("openButton");
var closeButton = document.getElementById("closeButton");
var joinButton = document.getElementById("joinButton");
var leaveButton = document.getElementById("leaveButton");

var localMouseSpan = document.getElementById("localMouse");
var sessionsUl = document.getElementById("sessions");

var activity;

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

function openActivity() {
  domain.activityService().open("testActivity").then(function(opened) {
    activity = opened;
    openButton.disabled = true;
    closeButton.disabled = false;
    joinButton.disabled = false;

    activity.on("session_joined", function(event) {
      handleSessionJoined(event);
    });

    activity.on("session_left", function(event) {
      handleSessionLeft(event);
    });

    activity.state().on("state_set", function(event) {
      handleStateSet(event);
    });
  });
}

function closeActivity() {
  activity.close().then(function() {
    openButton.disabled = false;
    closeButton.disabled = true;
    joinButton.disabled = true;
    leaveButton.disabled = true;
  });
}

function joinActivity() {
  activity.join().then(function() {
    joinButton.disabled = true;
    leaveButton.disabled = false;
  });
}

function leaveActivity() {
  activity.leave().then(function() {
    joinButton.disabled = false;
    leaveButton.disabled = true;
  });
}

function mouseMoved(evt) {
  var x = evt.clientX;
  var y = evt.clientY;
  localMouseSpan.innerHTML = " (" + x + "," + y + ")";
  if (activity && activity.joined()) {
    activity.state().set("pointer", {x: x, y: y});
  }
}

function handleSessionJoined(event) {
  var sessionLi = document.createElement("li");
  var sessionLabel = document.createElement("span");
  sessionLabel.innerHTML = event.userId + "(" + event.sessionId + "): ";
  sessionLi.appendChild(sessionLabel);

  var locationLabel = document.createElement("span");
  sessionLi.appendChild(locationLabel);

  sessionsUl.appendChild(sessionLi);
  if (!event.local) {
    var cursorDiv = document.createElement("div");
    cursorDiv.className = "remoteCursor";
    document.body.appendChild(cursorDiv);
  }

  remoteSessions[event.sessionId] = {
    sessionLi: sessionLi,
    locationLabel: locationLabel,
    cursorDiv: cursorDiv
  }

}

function handleSessionLeft(event) {
  var sessionRec = remoteSessions[event.sessionId];
  sessionRec.sessionLi.parentNode.removeChild(sessionRec.sessionLi);
  if (sessionRec.cursorDiv) {
    document.body.removeChild(sessionRec.cursorDiv);
  }
}

function handleStateSet(event) {
  var sessionRec = remoteSessions[event.sessionId];
  sessionRec.locationLabel.innerHTML = "(" + event.value.x+ "," + event.value.y +")"
  if (!event.local) {
    sessionRec.cursorDiv.style.top = event.value.y + "px";
    sessionRec.cursorDiv.style.left = event.value.x + "px";
  }
}