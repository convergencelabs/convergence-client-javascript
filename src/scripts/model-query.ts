#!/usr/bin/env npx ts-node --compiler-options {"module":"commonjs"}

import {connect} from "./connect";
import {ConvergenceDomain} from "../main";
let domain: ConvergenceDomain;

connect()
  .then(d => {
    domain = d;
    console.log("connected: ", d.session().sessionId());

    return domain.models().query("SELECT * FROM test");
  })
  .then(r => console.log(r))
  .then(() => domain.dispose())
  .catch(e => console.error(e));
