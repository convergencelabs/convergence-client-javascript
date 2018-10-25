#!/usr/bin/env node --require ts-node/register

import {connect} from "./connect";

let domain;

console.log("connecting...");
connect()
  .then(d => {
    domain = d;
    console.log("connected");
    console.log("disconnecting...");
    return domain.dispose();
  })
  .then(() => {
    console.log("disconnected");
  })
  .catch(e => console.error(e));
