#!/usr/bin/env node --require ts-node/register

import {connect} from "./connect";

connect()
  .then(domain => {
    console.log("connected");
    return domain.models().openAutoCreate({
      ephemeral: true,
      collection: "test",
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
    return model.close();
  })
  .catch(e => console.error(e));
