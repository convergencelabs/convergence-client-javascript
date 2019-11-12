/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {RichTextContent} from "./RichTextContent";

/**
 * @hidden
 * @internal
 */
export type RichTextIteratorDirection = "forward" | "backward";

/**
 * @hidden
 * @internal
 */
export interface RichTextIteratorOptions {
  range?: RichTextRange;
  startLocation?: RichTextLocation;
  endLocation?: RichTextLocation;
  direction?: RichTextIteratorDirection;
}

/**
 * @hidden
 * @internal
 */
export class RichTextIterator implements IterableIterator<RichTextContent> {

  private _direction: RichTextIteratorDirection;
  private _startLocation: RichTextLocation;
  private _startNode: RichTextNode;
  private _endLocation: RichTextLocation;
  private _endNode: RichTextNode;
  private _lastLocation: RichTextLocation;

  constructor(options: RichTextIteratorOptions) {
    if (Validation.isNotSet(options)) {
      throw new ConvergenceError("options must be specified.", "rich-text-iterator-no-options");
    }

    if (Validation.isNotSet(options.range) &&
      Validation.isNotSet(options.startLocation) &&
      Validation.isNotSet(options.endLocation)) {
      throw new ConvergenceError(
        "Either a range, startLocation, or endLocation must be defined in the options.",
        "rich-text-iterator-no-range-or-locations");
    }

    const direction = options.direction || "forward";
    if (direction !== "forward" && direction !== "backward") {
      throw new ConvergenceError(
        `Invalid rich text direction: ${options.direction}`,
        "rich-text-iterator-invalid-direction");
    }

    this._lastLocation = null;
    this._direction = direction;

    if (Validation.isSet(options.range)) {
      this._startLocation =  options.range.start();
      this._startNode = this._startLocation.getNode();
      this._endLocation = options.range.end();
      this._endNode = this._endLocation.getNode();
    } else {
      // We do not have a range, so one of startLocation or endLocation must be set.

      if (Validation.isSet(options.startLocation)) {
        this._startLocation = options.startLocation;
        this._startNode = this._startLocation.getNode();
      } else {
        // Range and start location not set, so we must have and end location
        // in the options, so the start location will be the root.
        this._startNode = options.endLocation.getNode().root();
        this._startLocation = RichTextLocation.ofContent(this._startNode);
      }

      if (Validation.isSet(options.endLocation)) {
        this._endLocation = options.endLocation;
        this._endNode = this._endLocation.getNode();
      } else {
        // Range and end location not set, so we must have and start location
        // in the options, so the end location will be the last node in the tree.
        this._endNode = this._getLastPreOrderNode(this._startNode.root());
        this._endLocation = RichTextLocation.ofContent(this._endNode);
      }
    }
  }

  public [ Symbol.iterator ](): IterableIterator<RichTextContent> {
    return this;
  }

  /**
   * Implements a pre-order traversal.
   * @returns {IteratorResult<RichTextContent>}
   */
  public next(): IteratorResult<RichTextContent> {
    let nodeToProcess: RichTextNode = null;
    let locationToProcesses = null;

    if (this._lastLocation === null) {
      // This is our first move. Therefore the first node we need to visit is the starting location.
      locationToProcesses = this._direction === "forward" ? this._startLocation : this._endLocation;
      nodeToProcess = locationToProcesses.getNode();
    } else {
      const lastNode = this._lastLocation.getNode();
      nodeToProcess = this._direction === "forward" ? this._getNextNode(lastNode) : this._getPrevNode(lastNode);

      if (nodeToProcess === null) {
        return {done: true, value: null};
      }
      locationToProcesses = RichTextLocation.ofContent(nodeToProcess);
    }

    this._lastLocation = locationToProcesses;

    if (nodeToProcess instanceof RichTextElement) {
      return this._createIteratorResult(nodeToProcess);
    } else if (nodeToProcess instanceof RichTextString) {
      let start = 0;
      let end = nodeToProcess.getData().length - 1;

      if (nodeToProcess === this._startNode && Validation.isSet(this._startLocation.getSubPath())) {
        start = this._startLocation.getSubPath();
      }

      if (nodeToProcess === this._endNode && Validation.isSet(this._endLocation.getSubPath())) {
        end = this._endLocation.getSubPath();
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

  private _getNextNode(lastNode: RichTextNode): RichTextNode {
    const next: RichTextNode = null;
    if (lastNode === this._endNode) {
      return null;
    } else {
      return this._nextPreOrderNode(lastNode);
    }
  }

  private _getPrevNode(lastNode: RichTextNode): RichTextNode {
    const next: RichTextNode = null;
    if (lastNode === this._startNode) {
      return null;
    } else {
      return this._previousPreOrderNode(lastNode);
    }
  }

  private _createIteratorResult(item: RichTextContent): IteratorResult<RichTextContent> {
    return {
      done: false,
      value: item
    };
  }

  private _nextPreOrderNode(curNode: RichTextNode): RichTextNode {
    if (curNode instanceof RichTextElement && curNode.hasChildren()) {
      // This is non-leaf node in the tree so we iterate down to its
      // first child.
      return curNode.getChild(0);
    } else {
      // We are att a leaf node so we need to try to go to the
      // next sibling. If there isn't one we try to go up to the
      // parent and then to the right.
      let cur: RichTextNode = curNode;
      let sibling: RichTextNode = null;
      while (cur !== null && sibling === null) {
        sibling = cur.nextSibling();
        if (sibling === null) {
          cur = cur.parent();
        }
      }

      return sibling;
    }
  }

  private _previousPreOrderNode(curNode: RichTextNode): RichTextNode {
    let sibling = curNode.previousSibling();

    if (Validation.isSet(sibling)) {
      // We found a sibling, so we need to traverse down the right sub
      // tree of the sibling as far as we can
      let cur = sibling;
      while (cur instanceof RichTextElement && cur.hasChildren()) {
        cur = cur.getChild(cur.childCount() - 1);
      }
      return cur;
    } else {
      // We did not find a sibling so we just go up to the parent.
      return curNode.parent();
    }
  }

  private _getLastPreOrderNode(root: RichTextRootElement): RichTextNode {
    let cur: RichTextNode = root;
    while (cur instanceof RichTextElement && cur.hasChildren()) {
      cur = cur.getChild(cur.childCount() - 1);
    }
    return cur;
  }
}

import {RichTextLocation} from "./RichTextLocation";
import {ConvergenceError} from "../../../../util";
import {RichTextRange} from "./RichTextRange";
import {RichTextElement} from "./RichTextElement";
import {RichTextNode} from "./RichTextNode";
import {RichTextString} from "./RichTextString";
import {RichTextStringFragment} from "./RichTextStringFragment";
import {RichTextRootElement} from "./RichTextRootElement";
import { Validation } from "../../../../util/Validation";
