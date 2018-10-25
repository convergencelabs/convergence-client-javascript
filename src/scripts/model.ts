#!/usr/bin/env node --require ts-node/register

import {connect} from "./connect";
import {ConvergenceDomain} from "../main/ts";
let domain: ConvergenceDomain;

connect()
  .then(d => {
    domain = d;
    console.log("connected");
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
    console.log("Model Open");
    console.log(JSON.stringify(model.root().value()));
    console.log(model.elementAt("nested", "property").path());
    console.log("Closing Model");
    return model.close();
  })
  .then(() => {
    console.log("Model closed");
    console.log("Disposing the domain.");
    return domain.dispose();
  })
  .then(() => {
    console.log("Domain Disposed");
  })
  .catch(e => console.error(e));
