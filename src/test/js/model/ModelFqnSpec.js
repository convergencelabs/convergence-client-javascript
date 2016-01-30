var convergence = require("../../../../build/convergence-client");
var expect = require('chai').expect;

describe('ModelFqn', function () {
    var ModelFqn = convergence.model.ModelFqn;

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
