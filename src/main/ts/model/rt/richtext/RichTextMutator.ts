import {RichTextDocument} from "./RichTextDocument";
import {RichTextLocation} from "./RichTextLocation";
import {RichTextNode} from "./RichTextNode";
import {RichTextString} from "./RichTextString";
import {RichTextElement} from "./RichTextElement";
import {AttributeUtils} from "./AttributeUtils";
import {RichTextRange} from "./RichTextRange";

export class RichTextMutator {
  private _doc: RichTextDocument;

  constructor(document: RichTextDocument) {
    this._doc = document;
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
      this.insert(new RichTextString(parent, this._doc, text, attributes), location);
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
    return this;
  }

  public setAttributes(): RichTextMutator {
    return this;
  }

  private _splitStingNode(node: RichTextString, index: number): void {
    const parent: RichTextElement = node.parent();
    node.removeFromParent();
    const leftNode = new RichTextString(parent, this._doc, node.getData().substr(0, index), parent.attributes());
    const rightNode = new RichTextString(parent, this._doc, node.getData().substr(index), parent.attributes());
    parent.insertChildren(index, [leftNode, rightNode]);
  }
}
