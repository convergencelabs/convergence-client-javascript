import * as chai from "chai"
import TransformationFunctionRegistry from "../../../../../main/ts/ot/xform/TransformationFunctionRegistry";
import StringInsertOperation from "../../../../../main/ts/ot/ops/StringInsertOperation";
import StringRemoveOperation from "../../../../../main/ts/ot/ops/StringRemoveOperation";
import StringSetOperation from "../../../../../main/ts/ot/ops/StringSetOperation";
import ArrayInsertOperation from "../../../../../main/ts/ot/ops/ArrayInsertOperation";
import ArrayRemoveOperation from "../../../../../main/ts/ot/ops/ArrayRemoveOperation";
import ArrayReplaceOperation from "../../../../../main/ts/ot/ops/ArrayReplaceOperation";
import ArrayMoveOperation from "../../../../../main/ts/ot/ops/ArrayMoveOperation";
import ArraySetOperation from "../../../../../main/ts/ot/ops/ArraySetOperation";
import ObjectAddPropertyOperation from "../../../../../main/ts/ot/ops/ObjectAddPropertyOperation";
import ObjectSetPropertyOperation from "../../../../../main/ts/ot/ops/ObjectSetPropertyOperation";
import ObjectRemovePropertyOperation from "../../../../../main/ts/ot/ops/ObjectRemovePropertyOperation";
import ObjectSetOperation from "../../../../../main/ts/ot/ops/ObjectSetOperation";
import BooleanSetOperation from "../../../../../main/ts/ot/ops/BooleanSetOperation";
import NumberAddOperation from "../../../../../main/ts/ot/ops/NumberAddOperation";
import NumberSetOperation from "../../../../../main/ts/ot/ops/NumberSetOperation";

var expect = chai.expect;
var fail = chai.assert.fail;

import * as fs from "fs";
import Operation from "../../../../../main/ts/ot/ops/Operation";
import DiscreteOperation from "../../../../../main/ts/ot/ops/DiscreteOperation";


var baseDir = "src/test/otspec";

var xformer = new TransformationFunctionRegistry();

fs.readdirSync(baseDir).forEach(function (file) {
  var contents = fs.readFileSync(baseDir + "/" + file, 'utf8');
  var spec = JSON.parse(contents);

  describe('A server ' + spec.serverOpType + " transforming against a client " + spec.clientOpType, function () {
    spec.cases.forEach(function (testCase: any): void {
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

function json2Operation(opData: any): DiscreteOperation {

  switch (opData.type) {
    case "StringInsert":
      return new StringInsertOperation(commonPath, opData.noOp, opData.index, opData.value);
    case "StringRemove":
      return new StringRemoveOperation(commonPath, opData.noOp, opData.index, opData.value);
    case "StringSet":
      return new StringSetOperation(commonPath, opData.noOp, opData.value);

    case "ArrayInsert":
      return new ArrayInsertOperation(commonPath, opData.noOp, opData.index, opData.value);
    case "ArrayRemove":
      return new ArrayRemoveOperation(commonPath, opData.noOp, opData.index);
    case "ArrayReplace":
      return new ArrayReplaceOperation(commonPath, opData.noOp, opData.index, opData.value);
    case "ArrayMove":
      return new ArrayMoveOperation(commonPath, opData.noOp, opData.fromIndex, opData.toIndex);
    case "ArraySet":
      return new ArraySetOperation(commonPath, opData.noOp, opData.value);

    case "ObjectAddProperty":
      return new ObjectAddPropertyOperation(commonPath, opData.noOp, opData.prop, opData.value);
    case "ObjectSetProperty":
      return new ObjectSetPropertyOperation(commonPath, opData.noOp, opData.prop, opData.value);
    case "ObjectRemoveProperty":
      return new ObjectRemovePropertyOperation(commonPath, opData.noOp, opData.prop);
    case "ObjectSet":
      return new ObjectSetOperation(commonPath, opData.noOp, opData.value);

    case "BooleanSet":
      return new BooleanSetOperation(commonPath, opData.noOp, opData.value);

    case "NumberAdd":
      return new NumberAddOperation(commonPath, opData.noOp, opData.value);
    case "NumberSet":
      return new NumberSetOperation(commonPath, opData.noOp, opData.value);

    default:
      throw new Error("Invalid operation definition");
  }
}
