import {RichTextLocation} from "./RichTextLocation";
import {ConvergenceError} from "../../../util/ConvergenceError";
import {RichTextRange} from "./RichTextRange";
import {RichTextElement} from "./RichTextElement";
import {RichTextNode} from "./RichTextNode";
import {RichTextString} from "./RichTextString";
import {RichTextContent} from "./RichTextContent";

export type RichTextIteratorDirection = "forward" | "backward";

export interface RichTextIteratorOptions {
  boundary?: RichTextRange;
  startLocation?: RichTextLocation;
  direction?: RichTextIteratorDirection;
  shallow?: boolean;
  individualCharacters?: boolean;
}

export class RichTextIterator implements IterableIterator<RichTextContent> {

  private _direction: RichTextIteratorDirection;
  private _location: RichTextLocation;
  private _shallow: boolean;
  private _boundary: RichTextRange;
  private _individualCharacters: boolean;
  private _boundaryStartParent: RichTextNode;
  private _boundaryEndParent: RichTextNode;
  private _visitedParent: RichTextElement;

  constructor(options: RichTextIteratorOptions) {
    if (!options.boundary && !options.startLocation) {
      throw new ConvergenceError(
        "Either a range or starting location must be defined.",
        "rich-text-iterator-no-range-or-start-location");
    }

    const direction = options.direction || "forward";

    if (direction !== "forward" && direction !== "backward") {
      throw new ConvergenceError(
        `Invalid rich text direction: ${direction}`,
        "rich-text-iterator-invalid-direction");
    }

    this._direction = direction;
    this._boundary = options.boundary || null;

    if (options.startLocation) {
      this._location = options.startLocation;
    } else {
      this._location = this._direction === "backward" ? this._boundary.start() : this._boundary.end();
    }

    this._individualCharacters = !!options.individualCharacters;
    this._shallow = options.shallow || false;
    this._boundaryStartParent = this._boundary ? this._boundary.start().getNode().parent() : null;
    this._boundaryEndParent = this._boundary ? this._boundary.end().getNode().parent() : null;
    this._visitedParent = this._location.getNode().parent();
  }

  public [ Symbol.iterator ](): IterableIterator<RichTextContent> {
    return this;
  }

  public skip(skip: (node: RichTextContent) => boolean) {
    let done: boolean;
    let value: RichTextContent;
    let prevLocation: RichTextLocation;
    let prevVisitedParent: RichTextElement;

    do {
      prevLocation = this._location;
      prevVisitedParent = this._visitedParent;

      ( {done, value} = this.next() );
    } while (!done && skip(value));

    if (!done) {
      this._location = prevLocation;
      this._visitedParent = prevVisitedParent;
    }
  }

  public next(): IteratorResult<RichTextContent> {
    if (this._direction === "forward") {
      return this._next();
    } else {
      return this._prev();
    }
  }

  private _next(): IteratorResult<RichTextContent> {
    const prevLocation = this._location;
    const location = this._location;
    const parent = this._visitedParent;

    if (parent.parent === null && location.getIndex() === parent.childCount() - 1) {
      return {done: true};
    }

    if (parent === this._boundaryEndParent && location.getIndex() === this._boundary.end().getIndex() - 1) {
      return {done: true};
    }

    const node = location.getNode();

    if (node instanceof RichTextElement) {
      if (this._shallow) {
        // todo
      } else {
        // todo
      }
    } else if (node instanceof RichTextString) {
      if (this._individualCharacters) {
        // todo
      } else {
        // todo
      }
    } else {
      // todo
    }
  }

  private _prev(): IteratorResult<RichTextContent> {
    const prevLocation = this._location;
    const location = this._location;
    const parent = this._visitedParent;

    if (parent.parent === null && location.getIndex() === 0) {
      return {done: true};
    }

    if (parent === this._boundaryStartParent && location.getIndex() === this._boundary.start().getIndex() - 1) {
      return {done: true};
    }

    const node = location.getNode();

    if (node instanceof RichTextElement) {
      if (this._shallow) {
        // todo
      } else {
        // todo
      }
    } else if (node instanceof RichTextString) {
      if (this._individualCharacters) {
        // todo
      } else {
        // todo
      }
    } else {
      // todo
    }
  }

  private _createIteratorResult(type: string,
                                item: RichTextContent,
                                prevLocation: RichTextLocation,
                                nextLocation: RichTextLocation,
                                length: number): IteratorResult<RichTextContent> {
    return {
      done: false,
      value: item
    };
  }
}
