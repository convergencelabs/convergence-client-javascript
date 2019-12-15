#!/usr/bin/env npx ts-node --compiler-options {"module":"commonjs"}

import {createDomain} from "../connect";
import {IdbStorageAdapter} from "../../main/storage/idb/";
import {OfflineModelSyncCompletedEvent} from "../../main/model/events/";
import {RealTimeModel} from "../../main";

// tslint:disable-next-line
require("fake-indexeddb/auto");

const MODELS_TO_CREATE = 1;
let modelIds: string[] = [];

const domain = createDomain({
  offline: {
    storage: new IdbStorageAdapter()
  }
});

async function createModels(): Promise<void> {
  let rtManifest = await createManifest();
  for (let i = 0; i < MODELS_TO_CREATE; i++) {
    let id = `created-offline-${i}`;
    // await createModel(id);
    rtManifest.root().set(id, new Date().getTime());
    // modelIds.push(id);
    console.log("Created offline model", id);
  }
  await rtManifest.close();
  console.log("Manifest closed after creating ");
}

async function createModel(id: string): Promise<string> {
  let modelService = domain.models();

  let model = await modelService.openAutoCreate({
    id,
    collection: "test"
  });
  await model.close();
  return model.modelId();
}

function createManifest(): Promise<RealTimeModel> {
  let modelService = domain.models();

  return modelService.openAutoCreate({
    id: "manifest",
    collection: "test"
  });
}

async function cleanupModels(): Promise<void> {
  for (let id of modelIds) {
    console.log("deleting", id);
    await domain.models().remove(id).catch(e => console.error(e));
  }
  await domain.models().remove("manifest").catch(e => console.error(e));
}

async function go() {
  domain.models().on(OfflineModelSyncCompletedEvent.NAME, async () => {
    console.log("model sync completed");

    rtManifest.root().set("foo", "bar");

    await cleanupModels();
    process.exit();
  });

  await domain.initializeOffline("test");
  await createModels();

  let rtManifest = await domain.models().open("manifest");

  console.log("going online");

  await domain.connectWithPassword({username: "test", password: "password"});

  for (let id of modelIds) {
    await domain.models().open(id);
    console.log("opened model", id);
  }
}

go().catch(e => console.log(e));
