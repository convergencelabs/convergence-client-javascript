import {RichTextDocument} from "./RichTextDocument";
import {RichTextNode} from "./RichTextNode";
import {RichTextElement} from "./RichTextElement";

export class RichTextString extends RichTextNode {
  private _data: string;

  constructor(parent: RichTextElement, document: RichTextDocument, data: string, attributes?: Map<string, any>) {
    super(parent, document, attributes);
    this._data = data;
  }

  public insert(index: number, str: string): RichTextNode {
    this._data = this._data.substring(0, index) +
      str +
      this._data.substring(index, this._data.length);

    return this;
  }

  public remove(index: number, length: number): RichTextNode {
    this._data = this._data.substring(0, index) +
      this._data.substring(index + length, this._data.length);

    return this;
  }

  public getData(): string {
    return this._data;
  }

  public textContentLength(): number {
    return this._data.length;
  }
}
