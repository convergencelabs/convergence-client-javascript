This is the API Documentation for the Convergence JavaScript client.  The main entry point is the [[Convergence]] class which has several methods for connecting to the Convergence Server. From there the [[ConvergenceDomain]] class will allow the developer use the various services provided by the Convergence Server.

The API Docs are organized by module which roughly relate to the main services that Convergence provides.  There are a few odds and ends that don't fit neatly into a service. They documentation modules are as follows:

* [Connection and Authentication](modules/connection_and_authentication.html)
* [Activities](modules/activities.html)
* [Chat](modules/chat.html)
* [Identity](modules/users_and_identity.html)
* [Presence](modules/presence.html)
* [Real Time Data](modules/real_time_data.html)
* [Offline](modules/offline.html)

## Getting Started
The example below shows a simple use case: Connecting to a <a href="https://guide.convergence.io/domain/overview.html" class="tsd-external-link">domain</a>, opening a [[RealTimeModel]] from the domain's [[ModelService]], and finally writing out the contents of that model to the console.  

```Typescript
import {Convergence} from "@convergence/convergence";

const url = "ws://localhost:8000/api/realtime/convergence/default";
const credentials = { username: "testuser", password: "changeme" };

Convergence
  .connectWithPassword(url, credentials)
  .then(domain => {
    return domain.models().open("someModelId");
  })
  .then(model => {
    console.log(model.root().value());
  })
  .catch(error => console.error(error));
```
