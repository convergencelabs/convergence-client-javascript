import {ModelFqn} from "../../../main/ts/model/ModelFqn";
import * as chai from "chai";
import ExpectStatic = Chai.ExpectStatic;

const expect: ExpectStatic = chai.expect;
const fail: Function = chai.assert.fail;

describe("ModelFqn", () => {

  it("Constructor set correct values", () => {
    const collection: string = "collection";
    const model: string = "model";

    const fqn: ModelFqn = new ModelFqn(collection, model);
    expect(fqn.collectionId).to.equal(collection);
    expect(fqn.modelId).to.equal(model);
  });

  it("Must be immutable", () => {
    const fqn: ModelFqn = new ModelFqn("collection", "model");

    try {
      fqn.collectionId = "foo";
      fail();
    } catch (e) {
      // no op
    }
  });
});
