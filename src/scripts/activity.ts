#!/usr/bin/env npx ts-node --compiler-options {"module":"commonjs"}
import {connect} from "./connect";

async function run() {
  const domain = await connect();
  const activity = await domain.activities()
    .join("test", "ephemeral-test-activity", {
      state: {foo: "bar"},
      lurk: false,
      autoCreate: {
        ephemeral: true,
        worldPermissions: ["join", "lurk", "view_state", "set_state"]
      }
    });

  console.log("Activity Joined");
  console.log("state", activity.state());
  activity.setState({"bar": false});

  const world = await activity.permissions().getWorldPermissions();
  console.log("World permissions: ", world);

  await activity.leave();
  await domain.dispose();
}

run().catch(e => console.error(e));
