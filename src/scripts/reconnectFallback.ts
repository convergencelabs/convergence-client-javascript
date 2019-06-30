#!/usr/bin/env npx ts-node --compiler-options {"module":"commonjs"}

import {createDomain} from "./connect";

const domain = createDomain();

domain
  .reconnect("bad token")
  .catch(e => console.error(e));
