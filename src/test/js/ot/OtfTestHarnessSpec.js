var expect = require('chai').expect;
var fs = require('fs');
var convergence = require("../../../../build/convergence-client");

var baseDir = "src/test/otspec";

var xformer = new convergence.ot.TransformationFunctionRegistry();

fs.readdirSync(baseDir).forEach(function (file) {
  var contents = fs.readFileSync(baseDir + "/" + file, 'utf8');
  var spec = JSON.parse(contents);

  describe('A server ' + spec.serverOpType + " transforming against a client " + spec.clientOpType, function () {
    spec.cases.forEach(function (testCase) {
      it(testCase.id, function () {
        var serverInputOp = json2Operation(testCase.input.serverOp);
        var clientInputOp = json2Operation(testCase.input.clientOp);

        if (testCase.error) {
          try {
            xformer.getOperationTransformationFunction(serverInputOp, clientInputOp);
            fail("The test case was expected to result in an error, but no excpetion was thrown");
          } catch(e) {
          }
        } else {
          var otf = xformer.getOperationTransformationFunction(serverInputOp, clientInputOp);
          var xformed = otf.transform(serverInputOp, clientInputOp);

          var serverOutputOp = json2Operation(testCase.output.serverOp);
          var clientOutputOp = json2Operation(testCase.output.clientOp);

          expect(serverOutputOp).to.deep.equal(xformed.serverOp);
          expect(clientOutputOp).to.deep.equal(xformed.clientOp);
        }

      });
    })

  });
});

var commonPath = [];

function json2Operation(opData) {

  switch (opData.type) {
    case "StringInsert":
      return new convergence.ot.StringInsertOperation(commonPath, opData.noOp, opData.index, opData.value);
    case "StringRemove":
      return new convergence.ot.StringRemoveOperation(commonPath, opData.noOp, opData.index, opData.value);
    case "StringSet":
      return new convergence.ot.StringSetOperation(commonPath, opData.noOp, opData.value);

    case "ArrayInsert":
      return new convergence.ot.ArrayInsertOperation(commonPath, opData.noOp, opData.index, opData.value);
    case "ArrayRemove":
      return new convergence.ot.ArrayRemoveOperation(commonPath, opData.noOp, opData.index);
    case "ArrayReplace":
      return new convergence.ot.ArrayReplaceOperation(commonPath, opData.noOp, opData.index, opData.value);
    case "ArrayMove":
      return new convergence.ot.ArrayMoveOperation(commonPath, opData.noOp, opData.fromIndex, opData.toIndex);
    case "ArraySet":
      return new convergence.ot.ArraySetOperation(commonPath, opData.noOp, opData.value);

    case "ObjectAddProperty":
      return new convergence.ot.ObjectAddPropertyOperation(commonPath, opData.noOp, opData.prop, opData.value);
    case "ObjectSetProperty":
      return new convergence.ot.ObjectSetPropertyOperation(commonPath, opData.noOp, opData.prop, opData.value);
    case "ObjectRemoveProperty":
      return new convergence.ot.ObjectRemovePropertyOperation(commonPath, opData.noOp, opData.prop);
    case "ObjectSet":
      return new convergence.ot.ObjectSetOperation(commonPath, opData.noOp, opData.value);

    case "BooleanSet":
      return new convergence.ot.BooleanSetOperation(commonPath, opData.noOp, opData.value);

    case "NumberAdd":
      return new convergence.ot.NumberAddOperation(commonPath, opData.noOp, opData.value);
    case "NumberSet":
      return new convergence.ot.NumberSetOperation(commonPath, opData.noOp, opData.value);

    default:
      throw new Error("Invalid operation definition");
  }
}
