import {RichTextContent} from "./RichTextContent";

export class RichTextRange implements Iterable<RichTextContent> {
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
  //
  // public getCommonParent(): RichTextElement {
  //   return this._start.getNearestCommonAncestor(this._end.);
  // }

  public getContentRoots(): RichTextContent[] {
    const iterator = new RichTextIterator({range: this});
    const result: RichTextContent[] = [];

    for (let content of iterator) {
      result.push(content);
    }
    return result;
  }

  public * [ Symbol.iterator ](): IterableIterator<RichTextContent> {
    yield* new RichTextIterator({range: this});
  }

  public iterator(): IterableIterator<RichTextContent> {
    return new RichTextIterator({range: this});
  }
}

import {RichTextLocation} from "./RichTextLocation";
import {RichTextIterator} from "./RichTextIterator";
