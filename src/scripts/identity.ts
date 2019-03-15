#!/usr/bin/env node --require ts-node/register

import {connect} from "./connect";

let domain;

console.log("connecting...");
connect()
  .then(d => {
    domain = d;
    console.log("connected");

    return domain.identity().profile();
  })
  .then((user) => {
    console.log(user);
    return domain.dispose();
  })
  .then(() => {
    console.log("disconnected");
  })
  .catch(e => console.error(e));
