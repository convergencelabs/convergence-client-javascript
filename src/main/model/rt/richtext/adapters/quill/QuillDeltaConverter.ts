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

import {
  RichTextDocument,
  RichTextRootElement,
  RichTextString,
  RichTextElement,
  RichTextNode
} from "../../model";
import {StringMap} from "../../../../../util/StringMap";
import {QuillDelta, QuillDeltaOperation} from "./QuillDelta";

const ROOT_NAME: string = "quill";
const ROOT_ELEMENT_NAME = "delta";
const BLOT_VALUE_ATTR: string = "$$ConvergenceQuillBlotValue$$";

/**
 * @hidden
 * @internal
 */
export class QuillDeltaConverter {

  public static getRoot(doc: RichTextDocument): RichTextRootElement {
    return doc.getRoot(ROOT_NAME);
  }

  public static docToDelta(doc: RichTextDocument): QuillDelta {
    const root: RichTextRootElement = doc.getRoot(ROOT_NAME);
    const deltaOps: QuillDeltaOperation[] = root.getChildren().map((child) => {
      if (child instanceof RichTextString) {

        const result: QuillDeltaOperation = {
          insert: child.getData()
        };

        if (child.attributes().size > 0) {
          result.attributes = StringMap.mapToObject(child.attributes());
        }

        return result;
      } else if (child instanceof RichTextElement) {
        const insert: any = {};
        const blotName = child.getName();
        const blotValue = child.getAttribute(BLOT_VALUE_ATTR);
        insert[blotName] = blotValue;

        const op: any = {insert};

        const attributes = StringMap.mapToObject(child.attributes());
        delete attributes[BLOT_VALUE_ATTR];
        if (Object.keys(attributes).length > 0) {
          op.attributes = attributes;
        }

        return op;
      } else {
        throw new Error("Unexpected element");
      }
    });

    return {ops: deltaOps};
  }

  public static deltaToDoc(delta: QuillDelta): RichTextDocument {
    const doc = new RichTextDocument();
    const root = QuillDeltaConverter.deltaToRoot(delta, doc);
    doc.addRoot(root);
    return doc;
  }

  public static deltaToRoot(delta: QuillDelta, doc: RichTextDocument): RichTextRootElement {
    const root = new RichTextRootElement(doc, ROOT_NAME, ROOT_ELEMENT_NAME);
    delta.ops.forEach((op: QuillDeltaOperation) => {
      root.appendChild(QuillDeltaConverter.convertInsertOp(op, root));
    });
    return root;
  }

  public static convertInsertOp(op: any, root: RichTextRootElement): RichTextNode {
    switch (typeof op.insert) {
      case "undefined":
        throw new Error("Document deltas should only have insert operations: " + JSON.stringify(op));
      case "string":
        return new RichTextString(root.document(), root, op.insert, StringMap.toStringMap(op.attributes));
      case "object":
        const keys = Object.keys(op.insert);
        if (keys.length !== 1) {
          throw new Error(
            "Invalid insert operation, the 'insert' object should have exactly 1 key: " +
            JSON.stringify(op));
        }
        const blotName = keys[0];
        const value: string = op.insert[blotName];

        const attributes = {...op.attributes};
        attributes[BLOT_VALUE_ATTR] = value;

        return new RichTextElement(
          root.document(),
          root,
          blotName,
          StringMap.toStringMap(attributes));
      default:
        throw new Error("Invalid insert delta: " + JSON.stringify(op));
    }
  }
}
