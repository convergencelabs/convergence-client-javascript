import {RichTextDocument} from "../model/RichTextDocument";
import {RichTextOperation} from "../operations/RichTextOperation";

export abstract class RichTextMutation {
  private _document: RichTextDocument;

  constructor(document: RichTextDocument) {
    this._document = document;
  }

  public abstract getOperations(): RichTextOperation[];
  public abstract type(): string;
}
