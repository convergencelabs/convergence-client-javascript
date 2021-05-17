#!/usr/bin/env npx ts-node --compiler-options {"module":"commonjs"}

import {connect} from "./connect";

connect()
  .then(domain => {
    return domain.presence().subscribe("doesn't exist");
  })
  .then(presence => {
    console.log("Presence Subscribed", presence);
  })
  .catch(e => console.error(e));

process.stdin.resume();
