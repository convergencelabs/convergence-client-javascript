import {RichTextDocument} from "./RichTextDocument";
import {RichTextElement} from "./RichTextElement";

export abstract class RichTextNode implements RichTextContent {
  private _parent: RichTextElement;
  private _document: RichTextDocument;
  private _attributes: Map<string, any>;

  constructor(parent: RichTextElement, document: RichTextDocument, attributes?: Map<string, any>) {
    this._parent = parent;
    this._document = document;
    this._attributes = attributes || new Map<string, any>();
  }

  public parent(): RichTextElement {
    return this._parent;
  }

  public index(): number {
    const pos = this._parent.getChildIndex(this);
    return pos;
  }

  public removeFromParent(): void {
    this._parent.removeChild(this.index());
  }

  public root(): RichTextNode {
    if (this._parent === null) {
      return this;
    } else {
      return this._parent.root();
    }
  }

  public document(): RichTextDocument {
    return this._document;
  }

  public attributes(): Map<string, any> {
    return new Map(this._attributes.entries());
  }

  public setAttribute(key: string, value: any): void {
    this._attributes.set(key, value);
  }

  public getAttribute(key: string): any {
    return this._attributes.get(key);
  }

  public removeAttribute(key: string): void {
    this._attributes.delete(key);
  }

  public abstract textContentLength(): number;
}
