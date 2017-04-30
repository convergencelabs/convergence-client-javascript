var domain;

// Connect to the domain.
Convergence.connect(DOMAIN_URL, test, password).then(d => {
  domain = d;
  console.log("connected");
}).catch(error => {
  throw error;
});

