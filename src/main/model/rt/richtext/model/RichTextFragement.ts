/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

/**
 * @hidden
 * @internal
 */
export class RichTextFragment {
  private readonly _children: RichTextNode[];

  constructor(document: RichTextDocument, children: RichTextNode[]) {
    this._children = children;
  }

  public getChildren(): RichTextNode[] {
    return this._children;
  }

  public textContentLength(): number {
    let length = 0;
    this._children.forEach(c => length += c.textContentLength());
    return length;
  }
}

import {RichTextNode} from "./RichTextNode";
import {RichTextDocument} from "./RichTextDocument";
