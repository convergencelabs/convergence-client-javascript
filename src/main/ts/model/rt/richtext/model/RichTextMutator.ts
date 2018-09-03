/**
 * @hidden
 * @internal
 */
export class RichTextMutator {
  private readonly _document: RichTextDocument;

  constructor(document: RichTextDocument) {
    this._document = document;
  }

  public insertText(location: RichTextLocation, text: string, attributes?: Map<string, any>): RichTextMutator {
    const node: RichTextNode = location.getNode();
    const index: number = location.getSubPath();

    // fixme need to handle if it is a rich text string, but different styels.
    if (node instanceof RichTextString && (
      !attributes || AttributeUtils.areAttributesEqual(attributes, node.attributes()))) {

      // Its the same style so we can just insert into the existing node, no
      // splitting and merging required
      node.insert(index, text);
    } else if (node instanceof RichTextElement) {
      this.insert(location, new RichTextString(this._document, node, text, attributes));
    } else {
      // fixme throw error
    }

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

        this._splitStingNode(node, index);
        parent.insertChild(nodeIndex + 1, content);
      }
    } else if (node instanceof RichTextElement) {
      node.insertChild(index, content);
    }

    return this;
  }

  public removeRange(range: RichTextRange): RichTextMutator {
    const startLocation = range.start();
    const endLocation: RichTextLocation = null; // need this to be tracked.

    const fragment = this._extractFromRangeContent(range);

    this._mergeSubtrees(startLocation, endLocation);

    return this;
  }

  // fixme the logic in here probable is needed for remove attribute as well. We should find a way to abstract
  // it.
  public setAttribute(range: RichTextRange, key: string, value: any): RichTextMutator {
    let currentRangeStart: RichTextLocation = null;

    let currentRangeValue: any;

    const iterator: IterableIterator<RichTextContent> = range.iterator();
    let item: IteratorResult<RichTextContent> = iterator.next();

    while (!item.done) {
      // get the value of the current ELEMENT.
      const itemValue = item.value.getAttribute(key);

      if (currentRangeStart === null) {
        currentRangeStart = RichTextLocation.ofContent(item.value);
        currentRangeValue = itemValue;
      }

      if (currentRangeValue !== itemValue || item.done) {
        // We are at the contiguous range, either because the value has changed
        // or because we are at the end of iteration.

        if (currentRangeValue !== value) {
          // The current range value is not the same as what we are trying to
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

  private _splitStingNode(node: RichTextString, index: number): void {
    const parent: RichTextElement = node.parent();
    node.removeFromParent();
    const leftNode = new RichTextString(this._document, parent, node.getData().substr(0, index), parent.attributes());
    const rightNode = new RichTextString(this._document, parent, node.getData().substr(index), parent.attributes());
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
