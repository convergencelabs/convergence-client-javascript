let domain;

// const jwt = `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InRlc3QifQ.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMiwiYXVkIjoiQ29udmVyZ2VuY2UifQ.0XRaEh-dOlj-rhlswNC2GgMeDGJ32SA1isory0DL5t3FnVihnnt14RN-J9Ao1gfSWuiY3udh23kmtoqJX4NZoGgtheF2JbJK_TVvtyw19PE-hUdDGb-1YcKBJjatsyg_fzDT7sHaqiX5CJUxdNEOF_1zxQo7JYTwQe-eSQQKcrTf2rrLtkaEweYoXFmN0eIyRNVsDgRUkG0_NrRya6n-9V4s0WPZ0-n6dPXKkD-rEqVJ6KefivHi95ARXIvz3Pl3EdpGPq7JMYvpn3k015YKG2GddWF_62D4JD1OgHU70SrvGJa59BjW0cLFFyqlglybgzgG_wVlLm8_IuZlP2elug`

Convergence.Logging.configure({
  root: "debug"
});

function connect() {
// Connect to the domain.
//   Convergence.connectWithJwt(DOMAIN_URL, jwt).then(d => {
// Convergence.connect(DOMAIN_URL, "test", "password").then(d => {
  Convergence.connectAnonymously(DOMAIN_URL, "test").then(d => {
    domain = d;
    console.log("connected");
  }).catch(error => {
    console.error("Could not connect", error);
  });
}
