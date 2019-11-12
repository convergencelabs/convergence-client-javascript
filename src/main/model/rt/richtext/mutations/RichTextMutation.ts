/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {RichTextDocument} from "../model/RichTextDocument";
import {RichTextOperation} from "../operations/RichTextOperation";

/**
 * @hidden
 * @internal
 */
export abstract class RichTextMutation {
  private _document: RichTextDocument;

  protected constructor(document: RichTextDocument) {
    this._document = document;
  }

  public abstract getOperations(): RichTextOperation[];
  public abstract type(): string;
}
