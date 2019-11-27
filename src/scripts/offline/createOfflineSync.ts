#!/usr/bin/env npx ts-node --compiler-options {"module":"commonjs"}

import {createDomain} from "../connect";
import { IdbStorageAdapter } from "../../main/storage/idb/IdbStorageAdapter";
import { OfflineModelSyncCompleteEvent } from "../../main/model/events/OfflineModelSyncPendingEvent";

/**
 * This requires an IndexedDB implementation:
 *
 * npm install --no-save fake-indexeddb
 */

// tslint:disable-next-line
require("fake-indexeddb/auto");

let modelIds: string[] = [];

const domain = createDomain({
  offline: {
    storage: new IdbStorageAdapter()
  }
});

async function createModels(): Promise<void> {
  for (let i = 0; i < 10; i++) {
    let id = `created-offline-${i}`;
    await createModel(id);
    modelIds.push(id);
    console.log("Created offline model", id);
  }
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

async function cleanupModels(): Promise<void> {
  for (let id of modelIds) {
    console.log("deleting", id);
    await domain.models().remove(id).catch(e => console.error(e));
  }
}

domain.connectOffline("test")
  .then(createModels)
  .then(() => {
    console.log("going online");
    domain.models().on(OfflineModelSyncCompleteEvent.NAME, async () => {
      console.log("model sync completed");
      await cleanupModels();
      process.exit();
    });
    return domain.connectWithPassword({username: "test", password: "password"});
  })
  .then(async () => {
    for (let id of modelIds) {
      await domain.models().open(id);
      console.log("opened model", id);
    }
  });

// domain.connectWithPassword({username: "test", password: "password"})
//   .then(() => {
//     for (let i = 0; i < 10; i++) {
//       modelIds.push(`created-offline-${i}`);
//     }
//   })
//   .then(cleanupModels)
//   .then(() => process.exit());
