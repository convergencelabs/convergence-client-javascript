#!/usr/bin/env node --require ts-node/register

import {connect} from "./connect";

connect()
  .then(domain => {
    console.log("connected");
  })
  .catch(e => console.error(e));
