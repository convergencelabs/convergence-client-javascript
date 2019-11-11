const anonymousConnect = document.getElementById("anonymousConnect");
const passwordConnect = document.getElementById("passwordConnect");
const jwtConnect = document.getElementById("jwtConnect");

const displayName = document.getElementById("displayName");
const username = document.getElementById("username");
const password = document.getElementById("password");
const jwt = document.getElementById("jwt");

let domain;

Convergence.configureLogging({
  root: "info",
  loggers: {
    "protocol.messages": "debug"
  }
});

function connectAnonymously() {
  Convergence.connectAnonymously(DOMAIN_URL, "test").then(d => {
    domain = d;
    onConnect();
  }).catch(error => {
    console.error("Could not connect", error);
  });
}

function connectJwt() {
  Convergence.connectWithJwt(DOMAIN_URL, jwt).then(d => {
    domain = d;
    onConnect();
  }).catch(error => {
    console.error("Could not connect", error);
  });
}

function connectPassword() {
  Convergence.connectWithPassword(DOMAIN_URL, {username: "test", password: "password"}).then(d => {
    domain = d;
    onConnect();
  }).catch(error => {
    console.error("Could not connect", error);
  });
}

function onConnect() {
  console.log("Convergence Connected");

  anonymousConnect.disabled = true;
  passwordConnect.disabled = true;
  jwtConnect.disabled = true;

  displayName.disabled = true;
  username.disabled = true;
  password.disabled = true;
  jwt.disabled = true;
}
