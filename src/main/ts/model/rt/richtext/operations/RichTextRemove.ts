import {RichTextOperation} from "./RichTextOperation";
import {RichTextFragment} from "../model/RichTextFragement";
import {RichTextRange} from "../model/RichTextRange";

/**
 * @hidden
 * @internal
 */
export class RichTextRemove implements RichTextOperation {
  private readonly _range: RichTextRange;
  private readonly _content: RichTextFragment;

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
