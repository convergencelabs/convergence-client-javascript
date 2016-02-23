import ModelFqn from "../../../main/ts/model/ModelFqn";
import * as chai from "chai";
import ExpectStatic = Chai.ExpectStatic;


var expect: ExpectStatic = chai.expect;
var fail: Function = chai.assert.fail;

describe('ModelFqn', () => {

  it('Constructor set correct values', () => {
    var collection: string = "collection";
    var model: string = "model";

    var fqn: ModelFqn = new ModelFqn(collection, model);
    expect(fqn.collectionId).to.equal(collection);
    expect(fqn.modelId).to.equal(model);
  });

  it('Must be immutable', () => {
    var fqn: ModelFqn = new ModelFqn("collection", "model");

    try {
      fqn.collectionId = "foo";
      fail();
    } catch (e) {
      // no op
    }
  });
});
