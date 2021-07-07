#!/usr/bin/env npx ts-node --compiler-options {"module":"commonjs"}

import {connect} from "../connect";
import {ConvergenceDomain} from "../../main";

let domain: ConvergenceDomain;

connect(undefined, true)
    .then(d => {
      domain = d;
      console.log("connected: ", d.session().sessionId());
      return d.models().openAutoCreate({
        ephemeral: true,
        collection: "test",
        id: "my-test-id",
        data: {
          nested: {
            property: "foo"
          }
        }
      });
    })
    .then(model => {
      console.log("Model Created");
      model.root().set("other", true);
      return model.close();
    })
    .then(() => {
      console.log("Model closed");
      return domain.dispose();
    })
    .catch(e => console.error(e));
