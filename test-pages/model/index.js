Convergence.configureLogging({
  loggers: {
    "protocol.messages": Convergence.LogLevel.DEBUG,
    "models": Convergence.LogLevel.DEBUG
  }
});

const app = new Vue({
  el: '#main',
  data: {
  }
});
