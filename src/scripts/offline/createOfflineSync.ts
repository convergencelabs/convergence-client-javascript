#!/usr/bin/env npx ts-node --compiler-options {"module":"commonjs"}

import {createDomain} from "../connect";
import {IdbStorageAdapter} from "../../main/storage/idb/";
import {OfflineModelSyncCompletedEvent} from "../../main/model/events/";
import {RealTimeModel} from "../../main";

// tslint:disable-next-line
require("fake-indexeddb/auto");

const MODELS_TO_CREATE = 6;
let modelIds: string[] = [];
let rtManifest;

const domain = createDomain({
  offline: {
    storage: new IdbStorageAdapter()
  }
});

async function createModels(): Promise<void> {
  for (let i = 0; i < MODELS_TO_CREATE; i++) {
    let id = `created-offline-${i}`;
    await createModel(id);
    rtManifest.root().set(id, new Date().getTime());
    modelIds.push(id);
    console.log("Created offline model", id);
  }
  await rtManifest.close();
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
  console.log("connecting online");

  await domain.connectWithPassword({username: "test", password: "password"});

  let result = await domain.models().query("select from test where id = 'manifest'");
  if (result.totalResults === 0) {
    domain.disconnect();
    // await domain.initializeOffline("test");

    domain.models().on(OfflineModelSyncCompletedEvent.NAME, async () => {
      console.log("model sync completed");

      // models[0].root().set("foo", "bar");

      await cleanupModels();
      process.exit();
    });

    rtManifest = await createManifest();
    await createModels();

    // let rtManifest = await domain.models().open("manifest");

    await domain.connectWithPassword({username: "test", password: "password"});

    let manifest = await domain.models().open("manifest");
    manifest.root().set("foo", "bar");

    // let models = [];
    // for (let id of modelIds) {
    //   let model = await domain.models().open(id);
    //   models.push(model);
    //   console.log("opened model", id);
    // }

  }

}

async function cleanUp() {
  for (let i = 0; i < MODELS_TO_CREATE; i++) {
    modelIds.push(`created-offline-${i}`);
  }

  await domain.connectWithPassword({username: "test", password: "password"});
  await cleanupModels();
  process.exit();
}
// cleanUp().catch(e => console.error(e));

go().catch(e => console.error(e));