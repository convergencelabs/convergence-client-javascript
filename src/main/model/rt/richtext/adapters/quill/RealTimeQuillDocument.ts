/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "COPYING" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {RichTextDocument, RichTextRootElement, RichTextRange, RichTextLocation} from "../../model";
import {QuillDeltaConverter} from "./QuillDeltaConverter";
import {QuillDelta} from "./QuillDelta";

/**
 * @hidden
 * @internal
 */
export class RealTimeQuillDocument {
  public static Events = {
    DELTA: "delta"
  };

  private readonly _doc: RichTextDocument;
  private readonly _root: RichTextRootElement;

  constructor(document: RichTextDocument) {
    this._doc = document;
    this._root = QuillDeltaConverter.getRoot(document);
  }

  public getValue(): QuillDelta {
    return QuillDeltaConverter.docToDelta(this._doc);
  }

  public setValue(delta: QuillDelta): void {
    const root: RichTextRootElement = QuillDeltaConverter.deltaToRoot(delta, this._doc);
    this._doc.replaceRoot(root);
  }

  public updateContents(delta: QuillDelta) {
    const deltaOps = delta.ops as any[];
    let cursor = 0;
    deltaOps.forEach((deltaOp) => {
      if (typeof deltaOp.retain === "number") {
        const endIndex = cursor + deltaOp.retain;
        const range: RichTextRange = new RichTextRange(
          RichTextLocation.ofTextOffset(this._root, cursor),
          RichTextLocation.ofTextOffset(this._root, endIndex)
        );
        if (deltaOp.attributes !== undefined) {
          Object.keys(deltaOp.attributes).forEach((key) => {
            const value = deltaOp.attributes[key];
            if (value !== null) {
              this._doc.setAttribute(range, key, value);
              console.log(`SetAttribute: ${range}, ${JSON.stringify(deltaOp.attributes)}`);
            } else {
              console.log(`RemoveAttribute: ${range}, ${JSON.stringify(deltaOp.attributes)}`);
              this._doc.removeAttribute(range, key);
            }
          });
        }
        cursor += deltaOp.retain;
      } else if (typeof deltaOp.delete === "number") {
        const endIndex = cursor + deltaOp.delete;
        const range: RichTextRange = new RichTextRange(
          RichTextLocation.ofTextOffset(this._root, cursor),
          RichTextLocation.ofTextOffset(this._root, endIndex)
        );
        this._doc.removeRange(range);
        console.log(`Delete(${range})`);
        cursor += deltaOp.delete;
      } else if (deltaOp.insert !== undefined) {
        const node = QuillDeltaConverter.convertInsertOp(deltaOp, this._root);
        const location = RichTextLocation.ofTextOffset(this._root, cursor);
        console.log(`Insert(${location}, ${node})`);
        this._doc.insert(location, node);
        cursor += deltaOp.insert.length;
      }
    });
  }
}
