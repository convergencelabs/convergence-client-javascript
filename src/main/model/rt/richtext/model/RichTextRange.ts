/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "LICENSE" and
 * "LICENSE.LGPL" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
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
