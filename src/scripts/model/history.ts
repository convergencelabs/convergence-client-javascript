#!/usr/bin/env npx ts-node --compiler-options {"module":"commonjs"}

import {connect} from "../connect";

async function run() {
  const domain = await connect(undefined, true);
  console.log("connected");

  console.log("Creating model");
  const model = await domain.models().openAutoCreate({
    ephemeral: true,
    collection: "history-test",
    id: "my-test-id",
    data: {}
  });

  console.log("\nGenerating model operations\n");

  console.log(`version ${model.version()}:`, model.time());
  await sleep(2000);

  model.root().set("k1", "v1");
  await sleep(2000);
  console.log(`version ${model.version()}:`, model.time());

  model.root().set("k2", "v2");
  await sleep(2000);
  console.log(`version ${model.version()}:`, model.time());

  model.root().set("k3", "v3");
  await sleep(2000);
  console.log(`version ${model.version()}:`, model.time());

  model.root().set("k4", "v4");
  await sleep(2000);
  console.log(`version ${model.version()}:`, model.time());


  //
  // History
  //
  console.log("\nHistorical Playback\n");
  const historical = await domain.models().history(model.modelId());
  console.log(`version ${historical.version()}:`, historical.time());

  await historical.playTo(4);
  console.log(`version ${historical.version()}:`, historical.time());

  await historical.playTo(3);
  console.log(`version ${historical.version()}:`, historical.time());

  await historical.playTo(2);
  console.log(`version ${historical.version()}:`, historical.time());

  await historical.playTo(1);
  console.log(`version ${historical.version()}:`, historical.time());


  await historical.playTo(2);
  console.log(`version ${historical.version()}:`, historical.time());

  await historical.playTo(3);
  console.log(`version ${historical.version()}:`, historical.time());

  await historical.playTo(4);
  console.log(`version ${historical.version()}:`, historical.time());

  await historical.playTo(5);
  console.log(`version ${historical.version()}:`, historical.time());

  await historical.playTo(1);
  console.log(`version ${historical.version()}:`, historical.time());

  await historical.playTo(5);
  console.log(`version ${historical.version()}:`, historical.time());

  await model.close();

  await domain.dispose()
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

run().catch(e => console.error(e));