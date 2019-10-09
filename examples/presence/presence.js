// These are the various inputs in the example page.
var usernameInput = document.getElementById("username");

var localAvailability = document.getElementById("localAvailability");
var localState = document.getElementById("localState");


var domain;
var presence;

function connect() {
  var url = "http://localhost:8080/convergence/default";
  Convergence.configureLogging({
    root: Convergence.LogLevel.DEBUG
  });
  Convergence.connectAnonymously(url, usernameInput.value).then(function(d) {
    domain = d;
    presence = domain.presence();
    updateLocal();
    presence.events().subscribe(function() {
      updateLocal();
    });
  });
}

function updateLocal() {
  localAvailability.innerHTML = presence.isAvailable();
  localState.innerHTML = JSON.stringify(Object.fromEntries(presence.state()));
}

function setState() {
  var key = document.getElementById("setKey").value;
  var value = document.getElementById("setValue").value;
  presence.setState(key, value);
}

function removeState() {
  var key = document.getElementById("removeKey").value;
  presence.removeState(kMey);
}

function clearState() {
  presence.clearState();
}

function disconnect() {
  domain.dispose();
}
