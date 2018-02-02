import {RichTextLocation} from "./RichTextLocation";
import {RichTextElement} from "./RichTextElement";
import {RichTextFragment} from "./RichTextFragement";
import {RichTextPartialString} from "./RichTextStringPartial";
import {RichTextNode} from "./RichTextNode";
import {RichTextDocument} from "./RichTextDocument";

export class RichTextRange {
  private _document: RichTextDocument;
  private _start: RichTextLocation;
  private _end: RichTextLocation;

  constructor(document: RichTextDocument, start: RichTextLocation, end: RichTextLocation) {
    this._document = document;
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

  public getContent(): RichTextContent[] {
    return [];
  }
}
