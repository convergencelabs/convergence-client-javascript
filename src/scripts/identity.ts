#!/usr/bin/env npx ts-node --compiler-options {"module":"commonjs"}

import {connect} from "./connect";

let domain;

connect()
  .then(d => {
    domain = d;

    return domain.identity().profile();
  })
  .then((user) => {
    console.log(user);
    return domain.dispose();
  })
  .catch(e => console.error(e));
