#!/usr/bin/env node --require ts-node/register

import {connect} from "./connect";

let domain;

connect()
  .then(d => {
    domain = d;
    return;
  })
  .catch(e => console.error(e));

process.stdin.resume();
