import {RichTextOperation} from "./RichTextOperation";
import {RichTextFragment} from "../model/RichTextFragement";
import {RichTextRange} from "../model/RichTextRange";

export class RichTextRemove implements RichTextOperation {
  private _range: RichTextRange;
  private _content: RichTextFragment;

  constructor(range: RichTextRange, content: RichTextFragment) {
    this._range = range;
    this._content = content;
  }

  public content(): RichTextFragment {
    return this._content;
  }

  public range(): RichTextRange {
    return this._range;
  }
}
