import {RichTextLocation} from "./RichTextLocation";
import {RichTextElement} from "./RichTextElement";
import {RichTextDocument} from "./RichTextDocument";
import {RichTextIterator} from "./RichTextIterator";
import {RichTextContent} from "./RichTextContent";

export class RichTextRange implements Iterable<RichTextContent> {
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

  public getContentRoots(): RichTextContent[] {
    const iterator = new RichTextIterator({boundary: this, shallow: true});
    const result: RichTextContent[] = [];

    for (let content of iterator) {
      result.push(content);
    }
    return result;
  }

  public * [ Symbol.iterator ](): IterableIterator<RichTextContent> {
    yield* new RichTextIterator({boundary: this});
  }

  public iterator(): IterableIterator<RichTextContent> {
    return new RichTextIterator({boundary: this});
  }
}
