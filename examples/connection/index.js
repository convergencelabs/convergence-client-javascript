let domain;

// Connect to the domain.
// Convergence.connectAnonymously(DOMAIN_URL).then(d => {
Convergence.connect(DOMAIN_URL, "test1", "password").then(d => {
  domain = d;
  console.log("connected");

  return domain.models().openAutoCreate({
    "collection": "foo",
    data: { str: "a string" },
    ephemeral: true
  });
}).then(model => {
  window.model = model;
}).catch(error => {
  throw error;
});

