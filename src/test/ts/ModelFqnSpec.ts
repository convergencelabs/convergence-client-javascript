import ModelFqn from "../../main/ts/model/ModelFqn";
import * as chai from "chai"

var expect = chai.expect;
var fail = chai.assert.fail;


describe('ModelFqn', function () {

  it('Constructor set correct values', function () {
    var collection = "collection";
    var model = "model";

    var fqn = new ModelFqn(collection, model);
    expect(fqn.collectionId).to.equal(collection);
    expect(fqn.modelId).to.equal(model);
  });

  it('Must be immutable', function () {
    var fqn = new ModelFqn("collection", "model");

    try {
      fqn.collectionId = "foo";
      fail();
    } catch (e) {
    }
  });
});
