#!/usr/bin/env node --require ts-node/register

import Convergence from "../main/ts/";
import * as WebSocket from "ws";

const url = "wss://convergence.dev.int.convergencelabs.tech/realtime/domain/test/foo";
// const url = "wss://localhost/realtime/domain/test/example";

Convergence
  .connect(url, "test1", "password", {
    webSocketFactory: (u) => new WebSocket(u, {rejectUnauthorized: false}),
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
