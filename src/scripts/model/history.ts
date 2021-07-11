#!/usr/bin/env npx ts-node --compiler-options {"module":"commonjs"}

import {connect} from "../connect";
import {HistoricalModel, RealTimeModel} from "../../main";

async function run() {
  const sleepTime = 1000;

  const domain = await connect(undefined, true);
  console.log("connected");

  console.log("Creating model");
  const model = await domain.models().openAutoCreate({
    ephemeral: true,
    collection: "history-test",
    id: "historical-test-model",
    data: {}
  });

  console.log("\nGenerating model operations\n");

  printModelTimeAndVersion(model);
  await sleep(sleepTime);

  model.root().set("k1", "v1");
  await sleep(sleepTime);
  printModelTimeAndVersion(model);

  const version2Time = model.time();

  model.root().set("k2", "v2");
  await sleep(sleepTime);
  printModelTimeAndVersion(model);

  const version3Time = model.time();

  model.root().set("k3", "v3");
  await sleep(sleepTime);
  printModelTimeAndVersion(model);

  const version4Time = model.time();

  model.root().set("k4", "v4");
  await sleep(sleepTime);
  printModelTimeAndVersion(model);


  //
  // History
  //
  console.log("\nHistorical Playback\n");
  const historical = await domain.models().history(model.modelId());
  printHistoricalTimeAndVersion(historical);

  await historical.playTo(4);
  printHistoricalTimeAndVersion(historical);

  await historical.playTo(3);
  printHistoricalTimeAndVersion(historical);

  await historical.playTo(2);
  printHistoricalTimeAndVersion(historical);

  await historical.playTo(1);
  printHistoricalTimeAndVersion(historical);


  await historical.playTo(2);
  printHistoricalTimeAndVersion(historical);

  await historical.playTo(3);
  printHistoricalTimeAndVersion(historical);

  await historical.playTo(4);
  printHistoricalTimeAndVersion(historical);

  await historical.playTo(5);
  printHistoricalTimeAndVersion(historical);

  await historical.playTo(1);
  printHistoricalTimeAndVersion(historical);

  await historical.playTo(5);
  printHistoricalTimeAndVersion(historical);

  console.log("\nPlay to Time\n");

  // Play to time exactly at version 2, because we request the
  // exact time.
  await historical.playToTime(version2Time);
  printHistoricalTimeAndVersion(historical);

  // Should play to version 3, because we ask for a time
  // between version 3 and version 4.
  const betweenVersion3And4 = new Date((version3Time.getTime() + version4Time.getTime()) / 2);
  await historical.playToTime(betweenVersion3And4);
  printHistoricalTimeAndVersion(historical);

  // Should play to version 5, because we ask for a time
  // after the last operation in the model.
  await historical.playToTime(new Date());
  printHistoricalTimeAndVersion(historical);

  await model.close();

  await domain.dispose();
}

function printModelTimeAndVersion(model: RealTimeModel) {
  console.log(`version ${model.version()}:`, model.time());
}

function printHistoricalTimeAndVersion(historical: HistoricalModel) {
  console.log(`version ${historical.version()}:`, historical.time());
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

run().catch(e => console.error(e));