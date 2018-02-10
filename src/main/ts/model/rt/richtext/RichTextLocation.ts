import {ConvergenceError} from "../../../util/ConvergenceError";

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
  private _subPath: any;

  constructor(root: RichTextRootElement, path: RichTextPath, subPath?: any) {
    if (Validation.isNotSet(root)) {
      throw new ConvergenceError("root must be set.");
    }

    if (Validation.isNotSet(path)) {
      throw new ConvergenceError("path must be set.");
    }

    this._root = root;
    this._path = path.slice(0);

    this._subPath = Validation.isSet(subPath) ? subPath : null;
  }

  public root(): RichTextRootElement {
    return this._root;
  }

  public path(): RichTextPath {
    return this._path.slice(0);
  }

  public getSubPath(): any {
    return this._subPath;
  }

  public getNode(): RichTextNode {
    return this._root.getChildByPath(this._path);
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

  public getChild(index: number): RichTextLocation {
    if (index < 0) {
      throw new ConvergenceError(`index must be >= 0: ${index}`);
    }
    const childPath = this._path.slice(0);
    childPath.push(index);
    return RichTextLocation.ofPath(this._root, childPath);
  }

  public getNearestCommonAncestor(other: RichTextLocation): RichTextLocation {
    if (Validation.isNotSet(other)) {
      throw new ConvergenceError(`other must be set: ${other}`);
    }

    if (other.root() !== this._root) {
      throw new ConvergenceError("Can not find ancestor of nodes with different root elements");
    }

    const otherPath = other.path();
    let minLen = Math.min(this._path.length, otherPath.length);
    let commonPath: RichTextPath = [];
    for (let i = 0; i < minLen; i++) {
      const thisVal = this._path[i];
      const otherVal = otherPath[i];

      if (thisVal !== otherVal) {
        break;
      } else {
        commonPath.push(thisVal);
      }
    }

    return RichTextLocation.ofPath(this._root, commonPath);
  }
}

import {RichTextElement} from "./RichTextElement";
import {RichTextNode} from "./RichTextNode";
import {RichTextRootElement} from "./RichTextRootElement";
import {RichTextContent} from "./RichTextContent";
import {RichTextString} from "./RichTextString";
import {Validation} from "../../../util/Validation";
