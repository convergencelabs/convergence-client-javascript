/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {RichTextContent} from "./RichTextContent";

/**
 * @hidden
 * @internal
 */
export class RichTextRange implements Iterable<RichTextContent> {
  private readonly _start: RichTextLocation;
  private readonly _end: RichTextLocation;

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

  public getContentRoots(): RichTextContent[] {
    const iterator = new RichTextIterator({range: this});
    const result: RichTextContent[] = [];

    for (const content of iterator) {
      result.push(content);
    }
    return result;
  }

  public* [Symbol.iterator](): IterableIterator<RichTextContent> {
    yield* new RichTextIterator({range: this});
  }

  public iterator(): IterableIterator<RichTextContent> {
    return new RichTextIterator({range: this});
  }
}

import {RichTextLocation} from "./RichTextLocation";
import {RichTextIterator} from "./RichTextIterator";
