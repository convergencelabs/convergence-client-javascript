#!/usr/bin/env npx ts-node --compiler-options {"module":"commonjs"}

import {connect} from "./connect";


async function run() {
  await connect();
  console.log("connected");
}

run().catch(e => console.error(e));
