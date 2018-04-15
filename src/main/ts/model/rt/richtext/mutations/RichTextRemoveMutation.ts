import {RichTextMutation} from "./RichTextMutation";
import {RichTextDocument} from "../model/RichTextDocument";
import {RichTextLocation} from "../model/RichTextLocation";
import {RichTextFragment} from "../model/RichTextFragement";
import {RichTextOperation} from "../operations/RichTextOperation";
import {RichTextInsert} from "../operations/RichTextInsert";
import {RichTextRange} from "../model/RichTextRange";
import {RichTextRemove} from "../operations/RichTextRemove";

export class RichTextInsertMutation extends RichTextMutation {
  public static get TYPE() {
    return "remove";
  };

  private _range: RichTextRange;
  private _content: RichTextFragment;
  private _removeOperation: RichTextRemove;

  constructor(document: RichTextDocument, range: RichTextRange, content: RichTextFragment) {
    super(document);
    this._range = range;
    this._content = content;
    this._removeOperation = new RichTextRemove(range, content);
  }

  public content(): RichTextFragment {
    return this._content;
  }

  public getOperations(): RichTextOperation[] {
    return [this._removeOperation];
  }

  public type(): string {
    return RichTextInsertMutation.TYPE;
  }
}
