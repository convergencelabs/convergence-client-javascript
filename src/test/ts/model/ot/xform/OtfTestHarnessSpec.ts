import {TransformationFunctionRegistry} from "../../../../../main/ts/model/ot/xform/TransformationFunctionRegistry";
import {StringInsertOperation} from "../../../../../main/ts/model/ot/ops/StringInsertOperation";
import {StringRemoveOperation} from "../../../../../main/ts/model/ot/ops/StringRemoveOperation";
import {StringSetOperation} from "../../../../../main/ts/model/ot/ops/StringSetOperation";
import {ArrayInsertOperation} from "../../../../../main/ts/model/ot/ops/ArrayInsertOperation";
import {ArrayRemoveOperation} from "../../../../../main/ts/model/ot/ops/ArrayRemoveOperation";
import {ArrayReplaceOperation} from "../../../../../main/ts/model/ot/ops/ArrayReplaceOperation";
import {ArrayMoveOperation} from "../../../../../main/ts/model/ot/ops/ArrayMoveOperation";
import {ArraySetOperation} from "../../../../../main/ts/model/ot/ops/ArraySetOperation";
import {ObjectAddPropertyOperation} from "../../../../../main/ts/model/ot/ops/ObjectAddPropertyOperation";
import {ObjectSetPropertyOperation} from "../../../../../main/ts/model/ot/ops/ObjectSetPropertyOperation";
import {ObjectRemovePropertyOperation} from "../../../../../main/ts/model/ot/ops/ObjectRemovePropertyOperation";
import {ObjectSetOperation} from "../../../../../main/ts/model/ot/ops/ObjectSetOperation";
import {BooleanSetOperation} from "../../../../../main/ts/model/ot/ops/BooleanSetOperation";
import {NumberAddOperation} from "../../../../../main/ts/model/ot/ops/NumberAddOperation";
import {NumberSetOperation} from "../../../../../main/ts/model/ot/ops/NumberSetOperation";
import {DiscreteOperation} from "../../../../../main/ts/model/ot/ops/DiscreteOperation";
import {OperationPair} from "../../../../../main/ts/model/ot/xform/OperationPair";
import {OperationTransformationFunction} from "../../../../../main/ts/model/ot/xform/OperationTransformationFunction";

import ExpectStatic = Chai.ExpectStatic;
import * as chai from "chai";
import * as fs from "fs";

const expect: ExpectStatic = chai.expect;
const fail: Function = chai.assert.fail;

const baseDir: string = "src/test/otspec";

const xformer: TransformationFunctionRegistry = new TransformationFunctionRegistry();

fs.readdirSync(baseDir).forEach((file: string) => {
  const contents: string = fs.readFileSync(baseDir + "/" + file, "utf8");
  const spec: any = JSON.parse(contents);

  describe("A server " + spec.serverOpType + " transforming against a client " + spec.clientOpType, () => {
    spec.cases.forEach((testCase: any) => {
      it(testCase.id, () => {
        const serverInputOp: DiscreteOperation = json2Operation(testCase.input.serverOp);
        const clientInputOp: DiscreteOperation = json2Operation(testCase.input.clientOp);

        if (testCase.error) {
          try {
            xformer.getOperationTransformationFunction(serverInputOp, clientInputOp);
            fail("The test case was expected to result in an error, but no excpetion was thrown");
          } catch (e) {
            // expected
          }
        } else {
          const otf: OperationTransformationFunction<DiscreteOperation, DiscreteOperation> =
            xformer.getOperationTransformationFunction(serverInputOp, clientInputOp);
          const xformed: OperationPair = otf(serverInputOp, clientInputOp);

          const serverOutputOp: DiscreteOperation = json2Operation(testCase.output.serverOp);
          const clientOutputOp: DiscreteOperation = json2Operation(testCase.output.clientOp);

          expect(serverOutputOp).to.deep.equal(xformed.serverOp);
          expect(clientOutputOp).to.deep.equal(xformed.clientOp);
        }
      });
    });
  });
});

const commonId: string = "vid";

function json2Operation(opData: any): DiscreteOperation {
  "use strict";

  switch (opData.type) {
    case "StringInsert":
      return new StringInsertOperation(commonId, opData.noOp, opData.index, opData.value);
    case "StringRemove":
      return new StringRemoveOperation(commonId, opData.noOp, opData.index, opData.value);
    case "StringSet":
      return new StringSetOperation(commonId, opData.noOp, opData.value);

    case "ArrayInsert":
      return new ArrayInsertOperation(commonId, opData.noOp, opData.index, opData.value);
    case "ArrayRemove":
      return new ArrayRemoveOperation(commonId, opData.noOp, opData.index);
    case "ArrayReplace":
      return new ArrayReplaceOperation(commonId, opData.noOp, opData.index, opData.value);
    case "ArrayMove":
      return new ArrayMoveOperation(commonId, opData.noOp, opData.fromIndex, opData.toIndex);
    case "ArraySet":
      return new ArraySetOperation(commonId, opData.noOp, opData.value);

    case "ObjectAddProperty":
      return new ObjectAddPropertyOperation(commonId, opData.noOp, opData.prop, opData.value);
    case "ObjectSetProperty":
      return new ObjectSetPropertyOperation(commonId, opData.noOp, opData.prop, opData.value);
    case "ObjectRemoveProperty":
      return new ObjectRemovePropertyOperation(commonId, opData.noOp, opData.prop);
    case "ObjectSet":
      return new ObjectSetOperation(commonId, opData.noOp, opData.value);

    case "BooleanSet":
      return new BooleanSetOperation(commonId, opData.noOp, opData.value);

    case "NumberAdd":
      return new NumberAddOperation(commonId, opData.noOp, opData.value);
    case "NumberSet":
      return new NumberSetOperation(commonId, opData.noOp, opData.value);

    default:
      throw new Error("Invalid operation definition");
  }
}
