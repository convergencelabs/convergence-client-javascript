import {RichTextOperation} from "./RichTextOperation";
import {RichTextLocation} from "../model/RichTextLocation";
import {RichTextFragment} from "../model/RichTextFragement";

/**
 * @hidden
 * @internal
 */
export class RichTextInsert implements RichTextOperation {
  private readonly _location: RichTextLocation;
  private readonly _content: RichTextFragment;

  constructor(location: RichTextLocation, content: RichTextFragment) {
    this._location = location;
    this._content = content;
  }

  public content(): RichTextFragment {
    return this._content;
  }

  public location(): RichTextLocation {
    return this._location;
  }
}
