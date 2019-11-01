/**
 * @hidden
 * @ignore
 * @internal
 */

import {OperationPair} from "../OperationPair";
import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {StringRemoveOperation} from "../../ops/StringRemoveOperation";
import {StringSetOperation} from "../../ops/StringSetOperation";

/**
 * @hidden
 * @internal
 * @ignore
 */
export const StringRemoveSetOTF: OperationTransformationFunction<StringRemoveOperation, StringSetOperation> =
  (s: StringRemoveOperation, c: StringSetOperation) => {
    // S-RS-1
    return new OperationPair(s.copy({noOp: true}), c);
  };
