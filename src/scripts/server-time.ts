#!/usr/bin/env npx ts-node --compiler-options {"module":"commonjs"}

import {connect} from "./connect";

async function run() {
  const domain = await connect();
  const requestTime = Date.now();
  const serverTime = await domain.serverTime();
  console.log("Response time: " + serverTime.getTime());
  const responseTime = Date.now();
  const delta = responseTime - requestTime;
  const serverTimeEstimate = new Date(serverTime.getTime() - delta);
  console.log("Adjusted time: " + serverTimeEstimate.getTime());
}

run().catch(e => console.error(e));


