var domain;

// Connect to the domain.
Convergence.connectAnonymously(DOMAIN_URL).then(d => {
  domain = d;
  console.log("connected");
}).catch(error => {
  throw error;
});

