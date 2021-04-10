#!/usr/bin/env npx ts-node --compiler-options {"module":"commonjs"}

import {connect} from "./connect";
import {ConvergenceDomain, RealTimeObject} from "../main";
let domain: ConvergenceDomain;

connect()
  .then(d => {
    domain = d;
    console.log("connected: ", d.session().sessionId());
    return d.models().create({
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
    domain.dispose();
  })
  .catch(e => console.error(e));
