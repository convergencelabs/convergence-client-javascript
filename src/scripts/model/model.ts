#!/usr/bin/env npx ts-node --compiler-options {"module":"commonjs"}

import {connect} from "../connect";
import {ConvergenceDomain, RealTimeString} from "../../main";

let domain: ConvergenceDomain;

connect(undefined, true)
  .then(d => {
    domain = d;
    console.log("connected: ", d.session().sessionId());
    return d.models().openAutoCreate({
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
  })
  .then(model => {
    console.log("Model Created");
    model.root().set("other", true);
    const str = model.root().get("string") as RealTimeString;
    str.splice(6, 5, "everyone");
    return model.close();
  })
  .then(() => {
    console.log("Model closed");
    return domain.dispose();
  })
  .catch(e => console.error(e));
