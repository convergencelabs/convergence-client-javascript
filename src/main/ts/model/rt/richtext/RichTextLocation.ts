import {RichTextContentTypes} from "./RichTextContentType";

export type RichTextPath = number[];

export class RichTextLocation {
  public static ofElement(node: RichTextElement): RichTextLocation {
    return new RichTextLocation(node.root(), node.path());
  }

  public static ofRoot(root: RichTextRootElement) {
    return new RichTextLocation(root, []);
  }

  private _root: RichTextElement;
  private _path: RichTextPath;

  constructor(root: RichTextElement, path: RichTextPath) {
    this._root = root;
    this._path = path;
  }

  public getParent(): RichTextNode {
    let parent = this._root;

    for (let i = 0; i < this._path.length - 1; i++) {
      parent = parent.getChild(this._path[i]);
    }

    return parent;
  }

  public getNode(): RichTextNode {
    if (this._path.length === 0) {
      return this._root;
    }

    let node = this.getParent();
    if (node.isA(RichTextContentTypes.ELEMENT)) {
      node = (node as RichTextElement).getChild(this._path[this._path.length - 1]);
    }

    return node;
  }

  public getIndexInParent(): number {
    return this._path.length > 0 ? this._path[this._path.length - 1] : null;
  }

  public getNearestCommonAncestor(other: RichTextLocation): RichTextElement {
    return null;
  }
}

import {RichTextElement} from "./RichTextElement";
import {RichTextNode} from "./RichTextNode";
import {RichTextRootElement} from "./RichTextRootElement";
