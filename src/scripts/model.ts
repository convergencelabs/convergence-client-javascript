#!/usr/bin/env node --require ts-node/register

import Convergence from "../main/ts/";
import * as WebSocket from "ws";
import {DOMAIN_PASSWORD, DOMAIN_URL, DOMAIN_USERNAME} from "./config";

Convergence
  .connect(DOMAIN_URL, DOMAIN_USERNAME, DOMAIN_PASSWORD, {
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
