let domain;

function connect() {
// Connect to the domain.
  Convergence.connectAnonymously(DOMAIN_URL).then(d => {
// Convergence.connect(DOMAIN_URL, "test", "password").then(d => {
    domain = d;
    console.log("connected");
  }).catch(error => {
    console.error("Could not connect", error);
  });
}
