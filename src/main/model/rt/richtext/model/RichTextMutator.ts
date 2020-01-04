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

import {RichTextLocationTransformer} from "./RichTextLocationTransformer";

/**
 * @hidden
 * @internal
 */
export class RichTextMutator {
  private readonly _document: RichTextDocument;

  constructor(document: RichTextDocument) {
    this._document = document;
  }

  public getDocument(): RichTextDocument {
    return this._document;
  }

  public insertText(location: RichTextLocation, text: string, attributes?: StringMapLike): RichTextMutator {
    const atts = StringMap.coerceToMap(attributes);
    const str = new RichTextString(this._document, null, text, atts);
    this.insert(location, str);
    return this;
  }

  public insert(location: RichTextLocation, content: RichTextNode): RichTextMutator {
    const node: RichTextNode = location.getNode();
    const index: number = location.getSubPath();

    if (node instanceof RichTextString) {
      if (content instanceof RichTextString &&
        AttributeUtils.areAttributesEqual(content.attributes(), node.attributes())
      ) {
        // Its the same style so we can just insert into the existing node, no
        // splitting and merging required
        node.insert(index, content.getData());
      } else {
        // otherwise split, add the content to the parent. We know we don't need to merge
        // afterwards because the either this is not text, or text with different attributes.
        const parent = node.parent();
        const nodeIndex = node.index();

        this._splitStringNode(node, index);
        parent.insertChild(nodeIndex + 1, content);
      }
    } else if (node instanceof RichTextElement || node instanceof RichTextRootElement) {
      node.insertChild(index, content);
    } else {
      throw new Error("Invalid insert location");
    }

    return this;
  }

  public removeRange(range: RichTextRange): RichTextMutator {
    const startLocation = range.start();

    // FIXME need this to be tracked as the subtree is changed.
    const endLocation: RichTextLocation = range.end();

    const xFormedRange = RichTextLocationTransformer.transformRemove(endLocation, range);

    const fragment = this._extractFromRangeContent(range);

    this._mergeSubtrees(startLocation, xFormedRange);

    return this;
  }

  // fixme the logic in here probable is needed for remove attribute as well.
  //   We should find a way to abstract it.
  public setAttribute(range: RichTextRange, key: string, value: any): RichTextMutator {
    let currentRangeStart: RichTextLocation = null;

    let currentRangeValue: any;

    const iterator: IterableIterator<RichTextContent> = range.iterator();
    let item: IteratorResult<RichTextContent> = iterator.next();

    while (!item.done) {
      // get the delta of the current ELEMENT.
      const itemValue = item.value.getAttribute(key);

      if (currentRangeStart === null) {
        currentRangeStart = RichTextLocation.ofContent(item.value);
        currentRangeValue = itemValue;
      }

      if (currentRangeValue !== itemValue || item.done) {
        // We are at the contiguous range, either because the delta has changed
        // or because we are at the end of iteration.

        if (currentRangeValue !== value) {
          // The current range delta is not the same as what we are trying to
          // set to, so we need a mutation.
          // fixme add the mutation.
        }

        currentRangeValue = itemValue;
        currentRangeStart = null;
      }

      item = iterator.next();
    }

    return this;
  }

  private _splitStringNode(node: RichTextString, index: number): void {
    const parent: RichTextElement = node.parent();
    node.removeFromParent();
    const leftNode = new RichTextString(this._document, parent, node.getData().substr(0, index), node.attributes());
    const rightNode = new RichTextString(this._document, parent, node.getData().substr(index), node.attributes());
    parent.insertChildren(index, [leftNode, rightNode]);
  }

  private _extractFromRangeContent(range: RichTextRange): RichTextFragment {
    const content: RichTextContent[] = range.getContentRoots();
    const children: RichTextNode[] = [];

    content.forEach(c => {
      if (c instanceof RichTextStringFragment) {
        const str = new RichTextString(this._document, null, c.getData(), c.attributes());
        children.push(str);
        c.removeFromString();
      } else if (c instanceof RichTextElement) {
        c.removeFromParent();
        children.push(c);
      }
    });

    return new RichTextFragment(this._document, children);
  }

  private _mergeSubtrees(start: RichTextLocation, end: RichTextLocation): void {
    const commonParent = start.getNearestCommonAncestor(end).getNode();

    // We are done merging since the start or end is already in the common parent.
    if (commonParent === start.getNode() || commonParent === end.getNode()) {
      return;
    }

    // now we need to get the two children of the common parent.
    const left: RichTextElement = null;
    const right: RichTextElement = null;

    // now we merge them
    this._merge(left, right);

    // now we remove any empty ancestors.
    let nextEnd = end.getNode() as RichTextElement;
    while (!nextEnd.hasChildren()) {
      nextEnd.removeFromParent();
      nextEnd = nextEnd.parent();
    }

    end = RichTextLocation.ofContent(nextEnd);

    // Continue merging next level.
    this._mergeSubtrees(start, end);
  }

  private _merge(left: RichTextElement, right: RichTextElement): void {
    const children = right.getChildren();
    left.appendChildren(children);

    right.removeFromParent();
  }
}

import {RichTextDocument} from "./RichTextDocument";
import {RichTextLocation} from "./RichTextLocation";
import {RichTextNode} from "./RichTextNode";
import {RichTextString} from "./RichTextString";
import {RichTextElement} from "./RichTextElement";
import {AttributeUtils} from "./AttributeUtils";
import {RichTextRange} from "./RichTextRange";
import {RichTextFragment} from "./RichTextFragement";
import {RichTextContent} from "./RichTextContent";
import {RichTextStringFragment} from "./RichTextStringFragment";
import {RichTextRootElement} from "./RichTextRootElement";
import {StringMap, StringMapLike} from "../../../../util/StringMap";
