import {RichTextString} from "./RichTextString";

export class RichTextPartialString {
  private _str: RichTextString;
  private _offset: number;
  private _length: number;

  constructor(str: RichTextString, offset: number, length: number) {
    this._str = str;
    this._offset = offset;
    this._length = length;
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
    return new RichTextString(null, this._str.document(), this.getData(), this._str.attributes());
  }
}
