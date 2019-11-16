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

import {RichTextNode} from "./RichTextNode";

/**
 * @hidden
 * @internal
 */
export class RichTextString extends RichTextNode {
  private _data: string;

  constructor(document: RichTextDocument, parent: RichTextElement, data: string, attributes?: Map<string, any>) {
    super(document, parent, attributes);
    this._data = data;
  }

  public insert(index: number, str: string): RichTextNode {
    this._data = this._data.substring(0, index) +
      str +
      this._data.substring(index, this._data.length);

    return this;
  }

  public remove(index: number, length: number): RichTextNode {
    this._data = this._data.substring(0, index) +
      this._data.substring(index + length, this._data.length);

    return this;
  }

  public getData(): string {
    return this._data;
  }

  public textContentLength(): number {
    return this._data.length;
  }

  public type(): RichTextContentType {
    return RichTextContentType.STRING;
  }

  public isA(type: RichTextContentType): boolean {
    return type === RichTextContentType.STRING;
  }

  public isLeaf(): boolean {
    return true;
  }

  public toString(): string {
    return `[RichTextString ` +
      `data: '${this._data}', ` +
      `attributes: ${JSON.stringify(StringMap.mapToObject(this.attributes()))}, ` +
      `path: ${JSON.stringify((this.path()))} ]`;
  }
}

import {RichTextElement} from "./RichTextElement";
import {RichTextDocument} from "./RichTextDocument";
import {RichTextContentType} from "./RichTextContentType";
import {StringMap} from "../../../../util/StringMap";
