import {RichTextDocument} from "./RichTextDocument";

export abstract class RichTextNode {
  private _parent: RichTextNode;
  private _document: RichTextDocument;
  private _attributes: Map<string, any>;

  constructor(parent: RichTextNode, document: RichTextDocument) {
    this._parent = parent;
    this._document = document;
    this._attributes = new Map<string, any>();
  }

  public parent(): RichTextNode {
    return this._parent;
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
