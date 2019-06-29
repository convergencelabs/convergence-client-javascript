#!/usr/bin/env node --require ts-node/register

import {connect} from "./connect";

let domain;

console.log("connecting...");
connect()
  .then(d => {
    domain = d;
    console.log("connected");

    domain.events().subscribe(e => {
        console.log(e.name);
    });

    return domain.dispose();
  })
  .catch(e => console.error(e));

// process.stdin.resume();
