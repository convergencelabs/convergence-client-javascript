import {RichTextContent} from "./RichTextContent";

export class RichTextStringFragment implements RichTextContent {
  private _str: RichTextString;
  private _offset: number;
  private _length: number;

  constructor(str: RichTextString, offset: number, length: number) {
    this._str = str;
    this._offset = offset;
    this._length = length;
  }

  public document(): RichTextDocument {
    return this._str.document();
  }

  public parent(): RichTextElement {
    return this._str.parent();
  }

  public root(): RichTextRootElement {
    return this._str.root();
  }

  public path(): RichTextPath {
    return this._str.path();
  }

  public offset(): number {
    return this._offset;
  }

  public length(): number {
    return this._length;
  }

  public getString(): RichTextString {
    return this._str;
  }

  public getData(): string {
    return this._str.getData().substring(this._offset, this._offset + this._length);
  }

  public removeFromString(): void {
    this._str.remove(this._offset, this._length);
    this._offset = 0;
    this._length = 0;
  }

  public textContentLength(): number {
    return this._str.textContentLength();
  }

  public toRichTextString(): RichTextString {
    return new RichTextString(this._str.document(), null, this.getData(), this._str.attributes());
  }

  public attributes(): Map<string, any> {
    return this._str.attributes();
  }

  public getAttribute(key: string): any {
    return this._str.getAttribute(key);
  }

  public hasAttribute(key: string): boolean {
    return this._str.hasAttribute(key);
  }

  public type(): RichTextContentType {
    return RichTextContentTypes.STRING_FRAGMENT;
  }

  public isA(type: RichTextContentType): boolean {
    return type === RichTextContentTypes.STRING_FRAGMENT;
  }

  public isLeaf(): boolean {
    return true;
  }

  public toString(): string {
    return `[RichTextStringFragment ` +
      `data: '${this.getData}', ` +
      `attributes: ${JSON.stringify(StringMap.mapToObject(this.attributes()))} ]`;
  }
}

import {RichTextString} from "./RichTextString";
import {RichTextContentType, RichTextContentTypes} from "./RichTextContentType";
import {RichTextRootElement} from "./RichTextRootElement";
import {RichTextDocument} from "./RichTextDocument";
import {RichTextElement} from "./RichTextElement";
import {RichTextPath} from "./RichTextLocation";
import {StringMap} from "../../../util/StringMap";
