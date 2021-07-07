#!/usr/bin/env npx ts-node --compiler-options {"module":"commonjs"}

import {createDomain} from "../../connect";
import {IdbStorageAdapter} from "../../../main/storage/idb";
import {OfflineModelsSyncCompletedEvent} from "../../../main/model/events";
import {RealTimeModel} from "../../../main";

// tslint:disable-next-line
require("fake-indexeddb/auto");

const domain = createDomain({
  offline: {
    storage: new IdbStorageAdapter()
  }
});

const modelId = "script-id-" + Date.now();

async function go(): Promise<void> {
  await domain.initializeOffline("test");

  domain.models().events().subscribe(e => console.log(`## Event(${e.name}): ${JSON.stringify(e)}`));

  await domain.models().create({
    id: modelId,
    collection: "test-collection",
    data: {
      "text": "some text data"
    }
  });

  console.log("## Model Created");

  const model = await domain.models().open(modelId);
  console.log("## Model Open");

  model.root().set("key", true);

  console.log("## Data Set");

  await model.close();

  console.log("## Model Closed");

  await domain.connectWithPassword({username: "test", password: "password"});

  console.log("## Connected");

  const reopen = await domain.models().open(modelId);

  console.log("## Model Opened again with value: ", JSON.stringify(reopen.root().value()));

  console.log("## Closing model");

  await reopen.close();

  console.log("## Model closed");

  await domain.models().remove(modelId);

  console.log("## Model Removed");

  domain.disconnect();

  domain.dispose();
}

go().catch(e => console.error(e));