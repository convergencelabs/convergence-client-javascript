import {RichTextLocation} from "./RichTextLocation";
import {RichTextElement} from "./RichTextElement";

export class RichTextRange {
  private _start: RichTextLocation;
  private _end: RichTextLocation;

  constructor(start: RichTextLocation, end: RichTextLocation) {
    this._start = start;
    this._end = end;
  }

  public start(): RichTextLocation {
    return this._start;
  }

  public end(): RichTextLocation {
    return this._end;
  }

  public getCommonParent(): RichTextElement {
    return this._start.getNearestCommonAncestor(this._end);
  }

  public getRoots(): RichTextContent[] {
    return [];
  }
}
