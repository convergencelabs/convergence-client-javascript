/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {RichTextOperation} from "./RichTextOperation";
import {RichTextFragment} from "../model/RichTextFragement";
import {RichTextRange} from "../model/RichTextRange";

/**
 * @hidden
 * @internal
 */
export class RichTextRemove implements RichTextOperation {
  private readonly _range: RichTextRange;
  private readonly _content: RichTextFragment;

  constructor(range: RichTextRange, content: RichTextFragment) {
    this._range = range;
    this._content = content;
  }

  public content(): RichTextFragment {
    return this._content;
  }

  public range(): RichTextRange {
    return this._range;
  }
}
