#!/usr/bin/env npx ts-node --compiler-options {"module":"commonjs"}

import {Convergence, LogLevel, RealTimeString, StringInsertEvent} from "../main";
import * as WebSocket from "ws";

const url = "http://localhost:8080/convergence/default"

Convergence.configureLogging({
  root: LogLevel.INFO
});

async function connectAndEditModel(i: number): Promise<void> {
  let randomNumber = Math.round(Math.random() * 100000);
  let convergenceUsername = 'Convergence User ' + randomNumber;

  console.log(`Client ${i} connecting`);

  const domain = await Convergence.connectAnonymously(url, convergenceUsername,
    {
      webSocket: {
        factory: (u) => new WebSocket(u, {rejectUnauthorized: false}),
        class: WebSocket
      },
      reconnect: {
        autoReconnect: true,
        fallbackAuth: (authChallenge) => {
          authChallenge.anonymous("dsf");
        }
      }
    });

  console.log(`Client ${i} connected`);

  // open an data model.
  const model = await domain.models().openAutoCreate({
    collection: "load-test-2",
    id: 'model_' + randomNumber,
    data: {
      name: "User name " + randomNumber,
      firstName: 'User'
    }
  });

  console.log(`Client ${i} opened model`);

  // Get the root element in the model.
  const data = model.root();

  let timeOutRandom = Math.round(2 + (Math.random() * 8)) * 1000;

  // Set some data
  data.set("firstName", "John" + randomNumber);
  data.set("lastName", "Doe" + randomNumber);

  // Get the firstName property directly
  const firstName = data.elementAt("firstName") as RealTimeString;

  // Listen for course grained changes
  firstName.on(RealTimeString.Events.VALUE, () => {
    console.log(firstName.value());
  });

  // Listen for course grained changes
  firstName.on(RealTimeString.Events.INSERT, (evt: StringInsertEvent) => {
    console.log(`characters '${evt.value}' added at position (${evt.index})`)
  });

  // Mutate the string at random intervals.
  setTimeout(() => {
    firstName.value("Set First Name " + randomNumber * 2);
  }, timeOutRandom);

  setTimeout(() => {
    firstName.insert(3, "insert3");
  }, timeOutRandom + 500);

  setTimeout(() => {
    firstName.insert(2, "insert2");
  }, timeOutRandom + 1000);

  setTimeout(() => {
    firstName.insert(8, "insert 4");
  }, timeOutRandom + 2500);
}

async function sleep(timeInMilliSeconds) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true);
    }, timeInMilliSeconds)
  })
}

(async () => {
  for (let i = 0; i < 3; i++) {
    connectAndEditModel(i).catch(e => console.log(e));
    await sleep(300);
  }
})();

process.on('SIGINT', () => {
  console.log('Exiting all ')
  process.exit(0);
});