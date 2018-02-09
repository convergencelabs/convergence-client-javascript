export type RichTextPath = number[];

export class RichTextLocation {

  public static ofRoot(root: RichTextRootElement) {
    return new RichTextLocation(root, []);
  }

  public static ofContent(node: RichTextContent): RichTextLocation {
    return new RichTextLocation(node.root(), node.path());
  }

  public static ofPath(root: RichTextRootElement, path: RichTextPath) {
    return new RichTextLocation(root, path);
  }

  public static ofStringIndex(node: RichTextString, index?: number) {
    return new RichTextLocation(node.root(), node.path(), index);
  }

  private _root: RichTextRootElement;
  private _path: RichTextPath;
  private _subpath: any;

  constructor(root: RichTextRootElement, path: RichTextPath, subpath?: any) {
    this._root = root;
    this._path = path;
    this._subpath = subpath !== undefined ? subpath : null;
  }

  public getParent(): RichTextLocation {
    let parent: RichTextElement = this._root;
    const path = this._path.slice(0);

    if (path.length > 0) {
      path.pop();
      return RichTextLocation.ofPath(this._root, path);
    } else {
      return null;
    }
  }

  public getNode(): RichTextNode {
    return this._root.getChildByPath(this._path);
  }

  public getSubpath(): any {
    return this._subpath;
  }
}

import {RichTextElement} from "./RichTextElement";
import {RichTextNode} from "./RichTextNode";
import {RichTextRootElement} from "./RichTextRootElement";
import {RichTextContent} from "./RichTextContent";
import {RichTextString} from "./RichTextString";
