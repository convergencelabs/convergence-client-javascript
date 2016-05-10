var openButton = document.getElementById("openButton");
var closeButton = document.getElementById("closeButton");
var joinButton = document.getElementById("joinButton");
var leaveButton = document.getElementById("leaveButton");

var localMouseSpan = document.getElementById("localMouse");

var activity;

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
  localMouseSpan.innerHTML = " (" + evt.clientX + "," +evt.clientY + ")";
  if (activity && activity.joined()) {
    activity.stateMap().set("pointer", {x: evt.clientX, y: evt.clientY});
  }
}

