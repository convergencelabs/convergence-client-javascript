export class RichTextMutator {
  private _document: RichTextDocument;

  constructor(document: RichTextDocument) {
    this._document = document;
  }

  public insertText(text: string, location: RichTextLocation, attributes?: Map<string, any>): RichTextMutator {
    const parent: RichTextNode = location.getNode();
    const index: number = location.getIndex();

    if (parent instanceof RichTextString && (
        !attributes || AttributeUtils.areAttributesEqual(attributes, parent.attributes()))) {

      // Its the same style so we can just insert into the existing node, no
      // splitting and merging required
      parent.insert(index, text);
    } else if (parent instanceof RichTextElement) {
      this.insert(new RichTextString(parent, this._document, text, attributes), location);
    } else {
      // fixme throw error
    }

    return this;
  }

  public insert(content: RichTextNode, location: RichTextLocation): RichTextMutator {
    const node: RichTextNode = location.getNode();
    const index: number = location.getIndex();

    if (node instanceof RichTextString) {
      if (content instanceof RichTextString &&
        AttributeUtils.areAttributesEqual(content.attributes(), node.attributes())
      ) {
        // Its the same style so we can just insert into the existing node, no
        // splitting and merging required
        node.insert(index, content.getData());
      } else {
        // otherwise split, add the content to the parent. We know we don't need to merge
        // afterwards because the either this is not text, or text with different attribites.
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

  public setAttribute(range: RichTextRange, key: string, value: any): RichTextMutator {
    let currentRangeStart: RichTextLocation = null;

    let currentRangeValue: any;
    let first = true;

    let iter = range.iterator();
    let item: IteratorResult<RichTextContent> = iter.next();

    while (!item.done) {
      // get the value of the current ELEMENT.
      const itemValue = item.value.getAttribute(key);

      if (currentRangeStart === null) {
        currentRangeStart = item.value.location();
        currentRangeValue = itemValue;
      }

      if (currentRangeValue !== itemValue || item.done) {
        // We are at the contiguous range, either because the value has changed
        // or because we are at the end of iteration.

        if (currentRangeValue !== value) {
          // The current range value is not the same as what we are trying to
          // set to, so we need a mutation.
          console.log(currentRangeStart,
            new RichTextLocation(item.value.location(), this._document, item.value.root()));
        }

        currentRangeValue = itemValue;
        currentRangeStart = null;
      }

      item = iter.next();
    }

    return this;
  }

  private _splitStingNode(node: RichTextString, index: number): void {
    const parent: RichTextElement = node.parent();
    node.removeFromParent();
    const leftNode = new RichTextString(parent, this._document, node.getData().substr(0, index), parent.attributes());
    const rightNode = new RichTextString(parent, this._document, node.getData().substr(index), parent.attributes());
    parent.insertChildren(index, [leftNode, rightNode]);
  }

  private _extractFromRangeContent(range: RichTextRange): RichTextFragment {
    const content: RichTextContent[] = range.getContentRoots();
    const children: RichTextNode[] = [];

    content.forEach(c => {
      if (c instanceof RichTextPartialString) {
        c.removeFromString();
        children.push(c.toRichTextString());
      } else if (c instanceof RichTextElement) {
        c.removeFromParent();
        children.push(c);
      }
    });

    return new RichTextFragment(this._document, children);
  }

  private _mergeSubtrees(start: RichTextLocation, end: RichTextLocation): void {
    const commonParent = start.getNearestCommonAncestor(end);

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

    end = nextEnd.location();

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
import {RichTextPartialString} from "./RichTextStringPartial";
import {RichTextFragment} from "./RichTextFragement";
import {RichTextContent} from "./RichTextContent";
