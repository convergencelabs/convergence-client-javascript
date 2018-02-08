import {RichTextContent} from "./RichTextContent";

export type RichTextIteratorDirection = "forward" | "backward";

export interface RichTextIteratorOptions {
  boundary?: RichTextRange;
  startLocation?: RichTextLocation;
  direction?: RichTextIteratorDirection;
  shallow?: boolean;
}

export class RichTextIterator implements IterableIterator<RichTextContent> {

  private _direction: RichTextIteratorDirection;
  private _startLocation: RichTextLocation;
  private _lastLocation: RichTextLocation;
  private _shallow: boolean;
  private _boundary: RichTextRange;
  private _boundaryStartNode: RichTextNode;
  private _boundaryEndNode: RichTextNode;

  constructor(options: RichTextIteratorOptions) {
    if (!Validation.isSet(options)) {
      throw new ConvergenceError("options must be specified.", "rich-text-iterator-no-options");
    }

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

    if (options.startLocation) {
      this._startLocation = options.startLocation;
    } else {
      this._startLocation = this._direction === "backward" ? this._boundary.start() : this._boundary.end();
    }

    this._lastLocation = null;

    this._direction = direction;
    this._boundary = options.boundary || null;
    this._shallow = options.shallow || false;
    this._boundaryStartNode = this._boundary ? this._boundary.start().getNode() : null;
    this._boundaryEndNode = this._boundary ? this._boundary.end().getNode() : null;
  }

  public [ Symbol.iterator ](): IterableIterator<RichTextContent> {
    return this;
  }

  // public skip(skip: (node: RichTextContent) => boolean) {
  //   let done: boolean;
  //   let value: RichTextContent;
  //   let prevLocation: RichTextLocation;
  //   let prevVisitedParent: RichTextElement;
  //
  //   do {
  //     prevLocation = this._location;
  //     prevVisitedParent = this._visitedParent;
  //
  //     ( {done, value} = this.next() );
  //   } while (!done && skip(value));
  //
  //   if (!done) {
  //     this._location = prevLocation;
  //     this._visitedParent = prevVisitedParent;
  //   }
  // }

  public next(): IteratorResult<RichTextContent> {
    if (this._direction === "forward") {
      return this._next();
    } else {
      return this._prev();
    }
  }

  // Pre-order traversal
  private _next(): IteratorResult<RichTextContent> {
    let nodeToProcess: RichTextNode = null;
    let locationToProcesses = null;

    if (this._lastLocation === null) {
      // This is our first move. Therefore the first node we need to visit is the starting location.
      locationToProcesses = this._startLocation;
      nodeToProcess = locationToProcesses.getNode();
    } else {
      const lastNode = this._lastLocation.getNode();
      if (lastNode === this._boundaryEndNode) {
        return {done: true, value: null};
      } else if (lastNode instanceof RichTextElement && lastNode.hasChildren() && !this._shallow) {
        // This is non-leaf node in the tree
        nodeToProcess = lastNode.getChild(0);
      } else {
        nodeToProcess = this._getNextAncestorSibling(lastNode);
        if (nodeToProcess === null) {
          return {done: true, value: null};
        }
      }
      locationToProcesses = RichTextLocation.ofContent(nodeToProcess);
    }

    this._lastLocation = locationToProcesses;

    if (nodeToProcess instanceof RichTextElement) {
      return this._createIteratorResult(nodeToProcess);
    } else if (nodeToProcess instanceof RichTextString) {
      let start = 0;
      let end = nodeToProcess.getData().length - 1;

      if (nodeToProcess === this._boundaryStartNode) {
        start = this._boundary.start().getIndexInParent();
      }

      if ( nodeToProcess === this._boundaryEndNode) {
        end = this._boundary.end().getIndexInParent();
      }

      if (start !== 0 || end !== nodeToProcess.getData().length - 1) {
        const fragment = new RichTextStringFragment(nodeToProcess, start, end - start);
        return this._createIteratorResult(fragment);
      } else {
        return this._createIteratorResult(nodeToProcess);
      }
    } else if (nodeToProcess === null) {
      return {done: true, value: null};
    }
  }

  private _getNextAncestorSibling(node: RichTextNode): RichTextNode {
    let cur = node;
    let sibling: RichTextNode = null;
    while (cur !== null && sibling === null) {
      sibling = cur.nextSibling();
      if (sibling === null) {
        cur = cur.parent();
      }
    }

    return sibling;
  }

  private _prev(): IteratorResult<RichTextContent> {
    // const prevLocation = this._location;
    // const location = this._location;
    // const parent = this._visitedParent;
    //
    // if (parent.parent === null && location.getIndex() === 0) {
    //   return {done: true, value: null};
    // }
    //
    // if (parent === this._boundaryStartParent && location.getIndex() === this._boundary.start().getIndex() - 1) {
    //   return {done: true, value: null};
    // }
    //
    // const node = location.getNode();
    //
    // if (node instanceof RichTextElement) {
    //   if (this._shallow) {
    //     // todo
    //   } else {
    //     // todo
    //   }
    // } else if (node instanceof RichTextString) {
    //   if (this._individualCharacters) {
    //     // todo
    //   } else {
    //     // todo
    //   }
    // } else {
    //   // todo
    // }
    return null;
  }

  private _createIteratorResult(item: RichTextContent): IteratorResult<RichTextContent> {
    return {
      done: false,
      value: item
    };
  }
}

import {RichTextLocation} from "./RichTextLocation";
import {ConvergenceError} from "../../../util/ConvergenceError";
import {RichTextRange} from "./RichTextRange";
import {RichTextElement} from "./RichTextElement";
import {RichTextNode} from "./RichTextNode";
import {RichTextString} from "./RichTextString";
import {Validation} from "../../../util/Validation";
import {RichTextContentTypes} from "./RichTextContentType";
// import {RichTextStringFragment} from "./RichTextStringFragment";
