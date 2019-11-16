/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3 
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "LICENSE" and
 * "LICENSE.LGPL" files (respectively), which are part of this source code 
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3 
 * and LGPLv3 licenses, if they were not provided.
 */

import {TransformationFunctionRegistry} from "../../../../main/model/ot/xform/TransformationFunctionRegistry";
import {StringInsertOperation} from "../../../../main/model/ot/ops/StringInsertOperation";
import {StringRemoveOperation} from "../../../../main/model/ot/ops/StringRemoveOperation";
import {StringSetOperation} from "../../../../main/model/ot/ops/StringSetOperation";
import {ArrayInsertOperation} from "../../../../main/model/ot/ops/ArrayInsertOperation";
import {ArrayRemoveOperation} from "../../../../main/model/ot/ops/ArrayRemoveOperation";
import {ArrayReplaceOperation} from "../../../../main/model/ot/ops/ArrayReplaceOperation";
import {ArrayMoveOperation} from "../../../../main/model/ot/ops/ArrayMoveOperation";
import {ArraySetOperation} from "../../../../main/model/ot/ops/ArraySetOperation";
import {ObjectAddPropertyOperation} from "../../../../main/model/ot/ops/ObjectAddPropertyOperation";
import {ObjectSetPropertyOperation} from "../../../../main/model/ot/ops/ObjectSetPropertyOperation";
import {ObjectRemovePropertyOperation} from "../../../../main/model/ot/ops/ObjectRemovePropertyOperation";
import {ObjectSetOperation} from "../../../../main/model/ot/ops/ObjectSetOperation";
import {BooleanSetOperation} from "../../../../main/model/ot/ops/BooleanSetOperation";
import {NumberDeltaOperation} from "../../../../main/model/ot/ops/NumberDeltaOperation";
import {NumberSetOperation} from "../../../../main/model/ot/ops/NumberSetOperation";
import {DiscreteOperation} from "../../../../main/model/ot/ops/DiscreteOperation";
import {OperationPair} from "../../../../main/model/ot/xform/OperationPair";
import {OperationTransformationFunction} from "../../../../main/model/ot/xform/OperationTransformationFunction";

import {expect, assert} from "chai";
import * as fs from "fs";
import {DateSetOperation} from "../../../../main/model/ot/ops/DateSetOperation";

const baseDir: string = "src/test/model/ot/xform/otspec";

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
            assert.fail("The test case was expected to result in an error, but no excpetion was thrown");
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

    case "NumberDelta":
      return new NumberDeltaOperation(commonId, opData.noOp, opData.value);
    case "NumberSet":
      return new NumberSetOperation(commonId, opData.noOp, opData.value);

    case "DateSet":
      return new DateSetOperation(commonId, opData.noOp, new Date(opData.value));
    default:
      throw new Error("Invalid operation definition");
  }
}
