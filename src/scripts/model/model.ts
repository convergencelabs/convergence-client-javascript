#!/usr/bin/env npx ts-node --compiler-options {"module":"commonjs"}

import {connect} from "../connect";
import {ConvergenceDomain, ModelPermissions, RealTimeString} from "../../main";

async function start() {
  const domain = await connect(undefined, true);

  console.log("connected: ", domain.session().sessionId());
  const model = await domain.models().openAutoCreate({
    ephemeral: false,
    collection: "test",
    id: "my-test-id",
    data: {
      string: "Hello World",
      nested: {
        property: "foo"
      }
    }
  });

  console.log("Model Created or Opened");

  await model.permissionsManager().setAllUserPermissions({
    "test": ModelPermissions.fromJSON({read: true, write: true, manage: false, remove: true})
  });

  await model.permissionsManager().setUserPermissions(
    "test", ModelPermissions.fromJSON({read: false, write: true, manage: false, remove: true}));

  model.root().set("other", true);
  const str = model.root().get("string") as RealTimeString;
  str.splice(6, 5, "everyone");
  await model.close();

  console.log("Model closed");
  await domain.dispose();
}

start().catch(e => console.error(e));