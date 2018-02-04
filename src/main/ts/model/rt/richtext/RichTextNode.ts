import {RichTextDocument} from "./RichTextDocument";
import {RichTextElement} from "./RichTextElement";
import {RichTextLocation, RichTextPath} from "./RichTextLocation";

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

  public _setParent(parent: RichTextElement): void {
    this._parent = parent;
  }

  public index(): number {
    if (this._parent !== null) {
      const pos = this._parent.getChildIndex(this);
      return pos;
    } else {
      return -1;
    }
  }

  public removeFromParent(): void {
    if (this._parent !== null) {
      this._parent.removeChild(this.index());
      this._parent = null;
    }
  }

  public path(): RichTextPath {
    return null;
  }

  public location(): RichTextLocation {
    return new RichTextLocation({
      path: this.parent().path(),
      index: this.index()
    },
    this._document,
      this.root());
  }

  public root(): RichTextElement {
    if (this._parent === null) {
      // todo fix this.
      return null;
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
