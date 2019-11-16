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

import {RichTextNode} from "./RichTextNode";

/**
 * @hidden
 * @internal
 */
export class RichTextElement extends RichTextNode {
  private _name: string;
  private readonly _children: RichTextNode[];

  constructor(document: RichTextDocument, parent: RichTextElement, name: string, attributes?: Map<string, any>) {
    super(document, parent, attributes);
    this._name = name;
    this._children = [];
  }

  public getName(): string {
    return this._name;
  }

  public setName(name: string): void {
    this._name = name;
  }

  public hasChildren(): boolean {
    return this._children.length > 0;
  }

  public childCount(): number {
    return this._children.length;
  }

  public getChildren(): RichTextNode[] {
    return this._children.slice(0);
  }

  public getChild(index: number): RichTextNode {
    return this._children[index];
  }

  public getChildIndex(child: RichTextNode): number {
    return this._children.indexOf(child);
  }

  public getChildByPath(path: RichTextPath): RichTextNode {
    // tslint:disable-next-line: no-this-assignment
    let node: RichTextNode = this;

    path.forEach((val, index) => {
      if (node.isA(RichTextContentType.ELEMENT) ||
        node.isA(RichTextContentType.ROOT) ||
        node.isA(RichTextContentType.OBJECT)) {
        node = (node as RichTextElement).getChild(val);
      } else if (!(node.isA(RichTextContentType.STRING) && index === path.length - 1)) {
        throw new ConvergenceError(`Invalid RichTextPath: ${path}`, "invalid-rich-text-path");
      }
    });

    return node;
  }

  public isLeaf(): boolean {
    return !this.hasChildren();
  }

  public insertChild(index: number, child: RichTextNode): void {
    this._children.splice(index, 0, child);
    child._setParent(this);
  }

  public insertChildren(index: number, children: RichTextNode[]): void {
    this._children.splice(index, 0, ...children);
    children.forEach(c => c._setParent(this));
  }

  public appendChild(child: RichTextNode): void {
    this._children.push(child);
    child._setParent(this);
  }

  public appendChildren(children: RichTextNode[]): void {
    this._children.push(...children);
    children.forEach(c => c._setParent(this));
  }

  public removeChild(index: number): void;
  public removeChild(child: RichTextNode): void;
  public removeChild(child: number | RichTextNode): void {
    let index: number = typeof child === "number" ? child : this._children.indexOf(child);

    if (index >= 0) {
      const removed = this._children.splice(index, 1);
      removed.forEach(c => c._setParent(null));
    }
  }

  public textContentLength(): number {
    // TODO we should cache this and then bubble up events to the root when it changes.
    let length = 0;
    this._children.forEach(c => length += c.textContentLength());
    return length;
  }

  public textOffsetToPath(offset: number): RichTextPath {
    let start = 0;
    for (let i = 0; i < this._children.length && offset < start; i++) {
      const child = this._children[i];
      const len = child.textContentLength();

      if (start + len >= offset) {
        const childOffset = offset - start;
        if (child instanceof RichTextElement) {
          [i].concat(child.textOffsetToPath(childOffset));
        } else {
          // fixme
        }
        return [i];
      } else {
        start = start + len;
      }
    }
    return [];
  }

  public type(): RichTextContentType {
    return RichTextContentType.ELEMENT;
  }

  public isA(type: RichTextContentType): boolean {
    return type === RichTextContentType.ELEMENT;
  }

  public toString(): string {
    return `[RichTextElement ` +
      `name: '${this._name}', ` +
      `children: [${this._children.length}], ` +
      `attributes: ${JSON.stringify(StringMap.mapToObject(this.attributes()))}, ` +
      `path: ${JSON.stringify((this.path()))} ]`;
  }
}

import {RichTextDocument} from "./RichTextDocument";
import {RichTextPath} from "./RichTextLocation";
import {ConvergenceError} from "../../../../util";
import {StringMap} from "../../../../util/StringMap";
import {RichTextContentType} from "./RichTextContentType";
