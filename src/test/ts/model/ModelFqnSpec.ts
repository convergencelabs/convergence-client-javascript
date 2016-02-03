
import * as chai from "chai";
import ModelFqn from "../../../main/ts/model/ModelFqn";


var expect = chai.expect;
var fail = chai.assert.fail;


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
    }
  });
});
