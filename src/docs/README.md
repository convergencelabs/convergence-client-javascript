# Introduction
This is the API documentation for the Convergence JavaScript client.  The main entrypoint is the [Convergence](classes/convergence.html) class which has several methods for connecting to the Convergence server. From there the [ConvergenceDomain](classes/convergencedomain.html) class will provide access to interact with the Convergence Domain and the various services it provides.

# Getting Started
The example below shows the basics for connecting to the Convergence Service.

```Typescript
import Convergence from "@convergence/convergence";

const url = "ws://localhost:8000/api/realtime/convergence/default";
Convergence
  .connect(url, "username", "password")
  .then(domain => {
    return domain.models.open("someModelId")
  })
  .then(model => {
    console.log(model.root().value());
  })
  .catch(error => console.error(error));
```