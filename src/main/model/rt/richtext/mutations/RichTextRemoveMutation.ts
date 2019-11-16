/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "LICENSE" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {RichTextMutation} from "./RichTextMutation";
import {RichTextDocument} from "../model/RichTextDocument";
import {RichTextFragment} from "../model/RichTextFragement";
import {RichTextOperation} from "../operations/RichTextOperation";
import {RichTextRange} from "../model/RichTextRange";
import {RichTextRemove} from "../operations/RichTextRemove";

/**
 * @hidden
 * @internal
 */
export class RichTextInsertMutation extends RichTextMutation {
  public static get TYPE() {
    return "remove";
  }

  private _range: RichTextRange;
  private _content: RichTextFragment;
  private _removeOperation: RichTextRemove;

  constructor(document: RichTextDocument, range: RichTextRange, content: RichTextFragment) {
    super(document);
    this._range = range;
    this._content = content;
    this._removeOperation = new RichTextRemove(range, content);
  }

  public content(): RichTextFragment {
    return this._content;
  }

  public getOperations(): RichTextOperation[] {
    return [this._removeOperation];
  }

  public type(): string {
    return RichTextInsertMutation.TYPE;
  }
}
