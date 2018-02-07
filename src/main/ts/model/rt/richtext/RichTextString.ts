import {RichTextNode} from "./RichTextNode";

export class RichTextString extends RichTextNode {
  private _data: string;

  constructor(document: RichTextDocument, parent: RichTextElement, data: string, attributes?: Map<string, any>) {
    super(document, parent, attributes);
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

  public type(): RichTextContentType {
    return RichTextContentTypes.STRING;
  }

  public isA(type: RichTextContentType): boolean {
    return type === RichTextContentTypes.STRING;
  }
}

import {RichTextElement} from "./RichTextElement";
import {RichTextDocument} from "./RichTextDocument";
import {RichTextContentType, RichTextContentTypes} from "./RichTextContentType";
