#!/usr/bin/env npx ts-node --compiler-options {"module":"commonjs"}

import {connect} from "./connect";
import {ConvergenceDomain} from "../main";

let domain: ConvergenceDomain;

connect()
  .then(d => {
    domain = d;
    console.log("connected: ", d.session().sessionId());
    // const query = "SELECT * FROM test WHERE @id = 'my-id'";
    const query = "SELECT * FROM test WHERE @@id = 'not-my-id' AND @version = 4";
    return domain.models().query(query);
  })
  .then(r => console.log(r))
  .then(() => domain.dispose())
  .catch(e => console.error(e));
