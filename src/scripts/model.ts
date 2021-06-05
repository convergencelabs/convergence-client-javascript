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
      id: "my-test-id2",
      data: {
        prop: undefined,
        array: [1, undefined, 2],
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
