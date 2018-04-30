import {RichTextNode} from "./RichTextNode";

export class RichTextElement extends RichTextNode {
  private _name: string;
  private _children: RichTextNode[];

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
    let node: RichTextNode = this;

    path.forEach((val, index) => {
      if (node.isA(RichTextContentTypes.ELEMENT) || node.isA(RichTextContentTypes.ROOT)) {
        node = (node as RichTextElement).getChild(val);
      } else if (!(node.isA(RichTextContentTypes.STRING) && index === path.length - 1)) {
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
    let index: number;
    if (typeof child === "number") {
      index = child;
    } else {
      index = this._children.indexOf(child);
    }

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

  public textOffsetToPath(offset: number): any {
    // looking for 17
    // [5, 10, 4, 6]
    let start = 0;
    let end = 0;
    for (let i = 0; i < this._children.length && offset < start; i++) {
      const child = this._children[i];
      const len = child.textContentLength();

      if (start + len >= offset) {
        return [child]
      } else {
        start = start + len;
      }
    }
  }

  public type(): RichTextContentType {
    return RichTextContentTypes.ELEMENT;
  }

  public isA(type: RichTextContentType): boolean {
    return type === RichTextContentTypes.ELEMENT;
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
import {ConvergenceError} from "../../../../util/ConvergenceError";
import {RichTextContentType, RichTextContentTypes} from "./RichTextContentType";
import {Validation} from "../../../../util/Validation";
import {StringMap} from "../../../../util/StringMap";
