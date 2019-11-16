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

import {RichTextContent} from "./RichTextContent";

/**
 * @hidden
 * @internal
 */
export class RichTextStringFragment implements RichTextContent {
  private _str: RichTextString;
  private _index: number;
  private _length: number;

  constructor(str: RichTextString, index: number, length: number) {
    this._str = str;
    this._index = index;
    this._length = length;
  }

  public document(): RichTextDocument {
    return this._str.document();
  }

  public parent(): RichTextElement {
    return this._str.parent();
  }

  public root(): RichTextRootElement {
    return this._str.root();
  }

  public path(): RichTextPath {
    return this._str.path();
  }

  public index(): number {
    return this._index;
  }

  public length(): number {
    return this._length;
  }

  public getString(): RichTextString {
    return this._str;
  }

  public getData(): string {
    return this._str.getData().substring(this._index, this._index + this._length);
  }

  public removeFromString(): void {
    this._str.remove(this._index, this._length);
    this._index = 0;
    this._length = 0;
  }

  public textContentLength(): number {
    return this._str.textContentLength();
  }

  public toRichTextString(): RichTextString {
    return new RichTextString(this._str.document(), null, this.getData(), this._str.attributes());
  }

  public attributes(): Map<string, any> {
    return this._str.attributes();
  }

  public getAttribute(key: string): any {
    return this._str.getAttribute(key);
  }

  public hasAttribute(key: string): boolean {
    return this._str.hasAttribute(key);
  }

  public type(): RichTextContentType {
    return RichTextContentType.STRING_FRAGMENT;
  }

  public isA(type: RichTextContentType): boolean {
    return type === RichTextContentType.STRING_FRAGMENT;
  }

  public isLeaf(): boolean {
    return true;
  }

  public toString(): string {
    return `[RichTextStringFragment ` +
      `data: '${this.getData()}', ` +
      `attributes: ${JSON.stringify(StringMap.mapToObject(this.attributes()))}, ` +
      `path: ${JSON.stringify((this.path()))} ]`;
  }
}

import {RichTextString} from "./RichTextString";
import {RichTextContentType} from "./RichTextContentType";
import {RichTextRootElement} from "./RichTextRootElement";
import {RichTextDocument} from "./RichTextDocument";
import {RichTextElement} from "./RichTextElement";
import {RichTextPath} from "./RichTextLocation";
import {StringMap} from "../../../../util/StringMap";
