#!/usr/bin/env node --require ts-node/register

import Convergence from "../main/ts/";
import * as WebSocket from "ws";

Convergence
  .connect("ws:localhost:8080/domain/test/example", "test1", "password", {
    webSocketClass: WebSocket,
    retryOnOpen: false
  })
  .then(domain => {
    console.log("connected");
    return domain.activities().join("foo");
  })
  .then(activity => {
    console.log("Activity Joined");
  })
  .catch(e => console.error(e));
