/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
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
