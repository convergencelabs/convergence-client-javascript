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
    return domain.models().openAutoCreate({
      ephemeral: true,
      collection: "test",
      data: {}
    });
  })
  .then(model => {
    console.log("Model Open");
    console.log(JSON.stringify(model.root().value()));
  })
  .catch(e => console.error(e));
