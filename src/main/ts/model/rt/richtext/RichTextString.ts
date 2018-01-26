import {RichTextDocument} from "./RichTextDocument";
import {RichTextNode} from "./RichTextNode";

export class RichTextString extends RichTextNode {
  private _data: string;

  constructor(parent: RichTextNode, document: RichTextDocument, data: string) {
    super(parent, document);
    this._data = data;
  }

  public getData(): string {
    return this._data;
  }

  public textContentLength(): number {
    return this._data.length;
  }
}
