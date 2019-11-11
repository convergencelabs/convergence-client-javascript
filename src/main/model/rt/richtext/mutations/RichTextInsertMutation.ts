import {RichTextMutation} from "./RichTextMutation";
import {RichTextDocument} from "../model/RichTextDocument";
import {RichTextLocation} from "../model/RichTextLocation";
import {RichTextFragment} from "../model/RichTextFragement";
import {RichTextOperation} from "../operations/RichTextOperation";
import {RichTextInsert} from "../operations/RichTextInsert";

/**
 * @hidden
 * @internal
 */
export class RichTextInsertMutation extends RichTextMutation {
  public static get TYPE() {
    return "insert";
  }

  private _location: RichTextLocation;
  private _content: RichTextFragment;
  private _insertOperation: RichTextOperation;

  constructor(document: RichTextDocument, location: RichTextLocation, content: RichTextFragment) {
    super(document);
    this._location = location;
    this._content = content;
    this._insertOperation = new RichTextInsert(location, content);
  }

  public content(): RichTextFragment {
    return this._content;
  }

  public getOperations(): RichTextOperation[] {
    return [this._insertOperation];
  }

  public type(): string {
    return RichTextInsertMutation.TYPE;
  }
}
