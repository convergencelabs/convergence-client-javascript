This is the API Documentation for the Convergence JavaScript client.  The main entry point is the [[Convergence]] class which has several methods for connecting to the Convergence server. From there the [[ConvergenceDomain]] class will provide access to interact with the Convergence Domain and the various services it provides.

## Getting Started
The example below shows a simple use case: Connecting to a <a href="https://docs.convergence.io/guide/domain/overview.html" class="tsd-external-link">domain</a>, opening a [[RealTimeModel]] from the domain's [[ModelService]], and finally writing out the contents of that model to the console.  

```Typescript
import Convergence from "@convergence/convergence";

const url = "ws://localhost:8000/api/realtime/convergence/default";
Convergence
  .connect(url, "username", "password")
  .then(domain => {
    return domain.models.open("someModelId");
  })
  .then(model => {
    console.log(model.root().value());
  })
  .catch(error => console.error(error));
```