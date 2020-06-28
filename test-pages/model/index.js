Convergence.configureLogging({
  loggers: {
    "protocol.messages": Convergence.LogLevel.INFO,
    "models": Convergence.LogLevel.INFO,
    "domain": Convergence.LogLevel.INFO,
    "storage": Convergence.LogLevel.INFO
  }
});

const app = new Vue({
  el: '#main',
  data: {
  }
});
