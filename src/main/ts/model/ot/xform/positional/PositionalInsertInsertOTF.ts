import {TransformationResultPair} from "../TransformationResult";
import {IndexTransformation} from "../TransformationResult";

export function transformPositionalInsertInsert(sIndex: number, cIndex: number):
  TransformationResultPair<IndexTransformation, IndexTransformation> {
  "use strict";

  if (sIndex <= cIndex) {
    // POS-II-1 and POS-II-2
    return {client: {index: cIndex + 1}};
  } else {
    // POS-II-3
    return {server: {index: sIndex + 1}};
  }
}
