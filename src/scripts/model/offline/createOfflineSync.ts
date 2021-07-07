#!/usr/bin/env npx ts-node --compiler-options {"module":"commonjs"}

import {createDomain} from "../../connect";
import {IdbStorageAdapter, OfflineModelsSyncCompletedEvent, RealTimeModel} from "../../../main";

// tslint:disable-next-line
require("fake-indexeddb/auto");

const MODELS_TO_CREATE = 1000;
const cleanUp = false;
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
    rtManifest.root().get("models").set(id, new Date().getTime());
    modelIds.push(id);
    console.log("Created offline model", id);
  }
  await rtManifest.close();
}

async function createModel(id: string): Promise<string> {
  let modelService = domain.models();

  let model = await modelService.openAutoCreate({
    id,
    collection: "test-model",
    data: {
      text: makeRandomData(256)
    }
  });
  await model.close();
  return model.modelId();
}

function createManifest(): Promise<RealTimeModel> {
  let modelService = domain.models();

  return modelService.openAutoCreate({
    id: "manifest",
    collection: "test-manifest"
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

  let result = await domain.models().query("select from test where id = 'offline-test'");
  if (result.totalResults === 0) {
    await domain.disconnect();
    await domain.initializeOffline("test");

    domain.models().on(OfflineModelsSyncCompletedEvent.NAME, async () => {
      console.log("model sync completed");

      if (cleanUp) {
        await cleanupModels();
      }
      process.exit();
    });

    rtManifest = await createManifest();
    rtManifest.root().set("models", []);
    await createModels();

    // let rtManifest = await domain.models().open("manifest");

    console.log("Connecting");
    await domain.connectWithPassword({username: "test", password: "password"});
    console.log("Connected, syncing models");
  }
}

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function makeRandomData(length) {
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() *
        charactersLength));
  }
  return result;
}

go().catch(e => console.error(e));