/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {RichTextElement} from "./RichTextElement";
import {RichTextNode} from "./RichTextNode";
import {RichTextRootElement} from "./RichTextRootElement";
import {RichTextContent} from "./RichTextContent";
import {RichTextString} from "./RichTextString";
import {ConvergenceError} from "../../../../util";
import {RichTextContentType} from "./RichTextContentType";
import { Validation } from "../../../../util/Validation";

/**
 * @hidden
 * @internal
 */
export type RichTextPath = number[];

interface PathAndOffset {
  path: RichTextPath;
  offset?: number;
}

/**
 * @hidden
 * @internal
 */
export class RichTextLocation {

  public static ofRoot(root: RichTextRootElement): RichTextLocation {
    return new RichTextLocation(root, []);
  }

  public static ofContent(node: RichTextContent): RichTextLocation {
    return new RichTextLocation(node.root(), node.path());
  }

  public static ofPath(root: RichTextRootElement, path: RichTextPath): RichTextLocation {
    return new RichTextLocation(root, path);
  }

  public static ofStringIndex(node: RichTextString, index?: number): RichTextLocation {
    return new RichTextLocation(node.root(), node.path(), index);
  }

  public static ofTextOffset(root: RichTextRootElement, offset: number): RichTextLocation {
    const pao = RichTextLocation.findPathAndOffset(root, offset);

    return new RichTextLocation(root, pao.path, pao.offset);
  }

  private static findPathAndOffset(element: RichTextElement, offset: number): PathAndOffset {
    let currentOffset = 0;

    for (let i = 0; i < element.childCount() && currentOffset <= offset; i++) {
      const child = element.getChild(i);
      const childLength = child.textContentLength();

      if (currentOffset + childLength > offset) {
        const remainingOffset = offset - currentOffset;

        if (child.type() === RichTextContentType.ELEMENT) {
          const pao = RichTextLocation.findPathAndOffset(child as RichTextElement, remainingOffset);
          return {
            path: [i].concat(pao.path),
            offset: pao.offset
          };
        } else {
          return {
            path: [i],
            offset: remainingOffset
          };
        }
      } else if (currentOffset + childLength === offset) {
        return {
          path: [i + 1]
        };
      } else {
        currentOffset = currentOffset + childLength;
      }
    }

    throw new ConvergenceError("Text offset out of bounds.");
  }

  private readonly _root: RichTextRootElement;
  private readonly _path: RichTextPath;
  private readonly _subPath: any;

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
    const minLen = Math.min(this._path.length, otherPath.length);
    const commonPath: RichTextPath = [];
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

  /**
   * @hidden
   * @internal
   */
  public _transform(): RichTextLocation {
    return null;
  }
}
