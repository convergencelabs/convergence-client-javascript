import {RichTextContent} from "./RichTextContent";

export type RichTextIteratorDirection = "forward" | "backward";

export interface RichTextIteratorOptions {
  range?: RichTextRange;
  startLocation?: RichTextLocation;
  direction?: RichTextIteratorDirection;
  shallow?: boolean;
}

export class RichTextIterator implements IterableIterator<RichTextContent> {

  private _direction: RichTextIteratorDirection;
  private _startLocation: RichTextLocation;
  private _startNode: RichTextNode;
  private _endLocation: RichTextLocation;
  private _endNode: RichTextNode;
  private _lastLocation: RichTextLocation;
  private _shallow: boolean;

  constructor(options: RichTextIteratorOptions) {
    if (!Validation.isSet(options)) {
      throw new ConvergenceError("options must be specified.", "rich-text-iterator-no-options");
    }

    if (!options.range && !options.startLocation) {
      throw new ConvergenceError(
        "Either a range or starting location must be defined.",
        "rich-text-iterator-no-range-or-start-location");
    }

    const direction = options.direction || "forward";
    if (direction !== "forward" && direction !== "backward") {
      throw new ConvergenceError(
        `Invalid rich text direction: ${options.direction}`,
        "rich-text-iterator-invalid-direction");
    }

    this._lastLocation = null;
    this._direction = direction;
    this._shallow = options.shallow || false;

    if (options.startLocation) {
      this._startLocation = options.startLocation;
      this._startNode = this._startLocation.getNode();
      this._endLocation = null;
      this._endNode = null;
    } else {
      this._startLocation = this._direction === "forward" ? options.range.start() : options.range.end();
      this._startNode = this._startLocation.getNode();
      this._endLocation = this._direction === "forward" ? options.range.end() : options.range.start();
      this._endNode = this._endLocation.getNode();
    }
  }

  public [ Symbol.iterator ](): IterableIterator<RichTextContent> {
    return this;
  }

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
      if (lastNode === this._endNode) {
        return {done: true, value: null};
      } else if (lastNode instanceof RichTextElement && lastNode.hasChildren() && !this._shallow) {
        // This is non-leaf node in the tree
        nodeToProcess = lastNode.getChild(0);
      } else {
        nodeToProcess = lastNode.nextShallowestSibling();
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

      if (nodeToProcess === this._startNode && this._startLocation.getSubpath()) {
        start = this._startLocation.getSubpath();
      }

      if (nodeToProcess === this._endNode && this._endLocation.getSubpath()) {
        end = this._endLocation.getSubpath();
      }

      if (start !== 0 || end !== nodeToProcess.getData().length - 1) {
        const fragment = new RichTextStringFragment(nodeToProcess, start, (end - start) + 1);
        return this._createIteratorResult(fragment);
      } else {
        return this._createIteratorResult(nodeToProcess);
      }
    } else if (nodeToProcess === null) {
      return {done: true, value: null};
    }
  }

  private _prev(): IteratorResult<RichTextContent> {
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
import {RichTextStringFragment} from "./RichTextStringFragment";
