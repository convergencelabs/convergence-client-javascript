#!/usr/bin/env npx ts-node --compiler-options {"module":"commonjs"}

import {connect} from "./connect";

connect()
  .then(domain => {
    return domain.activities().join("foo", {state: {foo: "bar"}});
  })
  .then(activity => {
    console.log("Activity Joined");
  })
  .catch(e => console.error(e));

process.stdin.resume();
