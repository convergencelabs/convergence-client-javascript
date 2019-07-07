#!/usr/bin/env npx ts-node --compiler-options {"module":"commonjs"}

import {connect} from "./connect";
import {Logging} from "../main/ts/";

const log = Logging.root();

connect()
  .then(domain => {
    return domain.activities().join("foo", {state: {foo: "bar"}});
  })
  .then(activity => {
    log.info("Activity Joined");
  })
  .catch(e => console.error(e));

process.stdin.resume();
