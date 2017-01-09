# Overview
This package provides a npm version of the Convergence JavaScript API, for use with the [Convergence](http://convergencelabs.com) host platform.

Convergence is a hosted platform for rapidly developing real-time collaborative applications. At the heart of Convergence is it's collaborative real time data store. Where other frameworks stop at attempting to provide real time data, Convergence goes further by providing **all** the features a developer needs to build an **effective** and **intuitive** collaborative application. Some of the feature highlights include:

* **Real-time Data**: Allows users to edit the same data at the same time, keeping everyone's view of the data in sync.
* **Users and Identity**: Allows developers to create and manage users and their identity within the system so users know who they are collaborating with.
* **Presence**: Allows users to know "who is here?" and "who is available" so they can more effectively collaborate with the other users they need to.
* **Collaboration Awareness**: The best way to resolve editing conflicts is to avoid them in the fist place. Convergence provides robust collaboration awareness capabilities that help users work together without conflicts.
* **Chat & Messaging**: Allow users to communicate through chat embedded directly in the application.

Convergence provides all of this and more in a single API reducing the time and complexity of gluing multiple frameworks together. With Convergence you can get up and running in hours, instead of months.

# Installation
```shell
npm install --save @convergence/convergence

```

# Example Usage
```javascript
const Convergence = require("@convergence/convergence").Convergence;
Convergence.connect("<domain-url>", "username", "password").then(domain => {
  // open an employee data model.
  return domain.models().open("employees", "doe.john");
}).then(model => {
  // Get the root elemenet in the model.
  const data = model.root();
  
  // Set some data
  data.set("fisrtName", "John");
  data.set("lastName", "Doe");
  
  // Get the firstName property directly
  const firstName = data.elementAt("firstName");
  
  // Rest the first name's value
  firstName.value("Dan");
  
  // Listen for course grained changes
  firstName.on("value", () => {
    console.log(firstName.value)
  });
  
  // Insert 'ny' into the string at index 3.
  firstName.insert(3, "ny");
  
  // Listen for course grained changes
  firstName.on("insert", (evt) => {
    console.log(`characters '${evt.value}' added at position (${evt.index})`)
  });
});
```

# Documentation
The full compliment of Convergence documentation can be found here:

http://convergencelabs.com/learn/

# Hot-Linking in the Browser
Convergence requires RxJS 5.x.  This dependency is taken care of when using the npm module.  If including via a script tag, you have two options.

1) Include Convergence With RxJS Bundled
```html
<script src="node_modules/@convergence/convergence/browser/convergence-all.js"></script>
```

2) With Convergence without RxJS Bundled
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/rxjs/5.0.1/Rx.js"></script>
<script src="node_modules/@convergence/convergence/browser/convergence.js"></script>
```