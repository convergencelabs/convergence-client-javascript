/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "COPYING" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {RealTimeElement} from "./RealTimeElement";
import {StringNode} from "../internal/StringNode";
import {RealTimeModel} from "./RealTimeModel";
import {
  LocalModelReference,
  ModelReference,
  IndexReference,
  LocalIndexReference,
  LocalRangeReference,
  RangeReference
} from "../reference";
import {StringSetOperation} from "../ot/ops/StringSetOperation";
import {
  StringNodeInsertEvent,
  StringNodeRemoveEvent,
  StringNodeSetValueEvent,
  ModelNodeEvent, StringNodeSpliceEvent
} from "../internal/events";
import {ModelEventCallbacks} from "../internal/ModelEventCallbacks";
import {RealTimeWrapperFactory} from "./RealTimeWrapperFactory";
import {
  ObservableString,
  ObservableStringEvents,
  ObservableStringEventConstants
} from "../observable/ObservableString";
import {IdentityCache} from "../../identity/IdentityCache";
import {StringSpliceOperation} from "../ot/ops/StringSpliceOperation";

/**
 * @module Real Time Data
 */
export interface RealTimeStringEvents extends ObservableStringEvents {
}

/**
 * This is a distributed string that wraps a native javascript `string`.  Most often,
 * these objects are mutated with the [[insert]] and [[remove]] methods which can operate
 * on either individual characters or substrings.
 *
 * See [[RealTimeStringEvents]] for the events that can be emitted on remote
 * changes to this object.
 *
 * Convergence supports two types of
 * [references](https://docs.convergence.io/guide/models/references/realtimestring.html)
 * unique to [[RealTimeString]]s.  These are useful for rendering remote cursors and
 * selections.
 *
 * See the
 * [developer guide](https://docs.convergence.io/guide/models/data/real-time-string.html)
 * for the most common use cases.
 *
 * @module Real Time Data
 */
export class RealTimeString extends RealTimeElement<string> implements ObservableString {

  /**
   * A mapping of the events this array could emit to each event's unique name.
   * Use this to refer an event name, e.g.
   *
   * ```typescript
   * rtStr.on(RealTimeString.Events.INSERT, function listener(e) {
   *   // ...
   * })
   * ```
   */
  public static readonly Events: RealTimeStringEvents = ObservableStringEventConstants;

  /**
   * Constructs a new RealTimeString.
   *
   * @hidden
   * @internal
   */
  constructor(delegate: StringNode,
              callbacks: ModelEventCallbacks,
              wrapperFactory: RealTimeWrapperFactory,
              model: RealTimeModel,
              identityCache: IdentityCache) {
    super(delegate, callbacks, wrapperFactory, model,
      [ModelReference.Types.INDEX, ModelReference.Types.RANGE], identityCache);

    this._delegate.events().subscribe(e => this._handleDelegateModelEvents(e));
  }

  /**
   * Inserts a substring of zero or more characters into this string at the provided
   * index. Subsequent characters are shifted to the right appropriately.
   *
   * ```typescript
   * rtString.value() // "Hello world"
   * rtString.insert(6, 'magical ');
   * rtString.value() // "Hello magical world"
   * ```
   *
   * On a successful `insert`, a [[StringInsertEvent]] will be emitted to any remote users.
   *
   * @param index the zero-based index at which to being inserting the new `value`
   * @param value the single character or substring to be inserted
   */
  public insert(index: number, value: string): void {
    this._assertWritable();
    this._string.insert(index, value);
  }

  /**
   * Removes `length` characters from this string, starting at `index`.  Subsequent
   * characters are left-shifted appropriately.
   *
   * On a successful `remove`, a [[StringRemoveEvent]] will be emitted to any remote users.
   *
   * ```typescript
   * rtString.value() // "Hello world"
   * rtString.remove(0, 6);
   * rtString.value() // "world"
   * ```
   *
   * @param index the zero-based index at which to start removing characters
   * @param length the number of characters to remove
   */
  public remove(index: number, length: number): void {
    this._assertWritable();
    this._string.remove(index, length);
  }

  /**
   * Replaces a portion of the string with a new value at `index`. The splice
   * method will remove `deleteCount` characters at `index` (inclusive) and then
   * insert `insertValue` at `index`.Subsequent characters are shifted left or right
   * based on if more characters are inserted or removed.
   *
   * Note that it is possible to perform a remove, without inserting a new value.
   * Likewise, it is possible to insert a new string without removing any
   * existing characters.  In this way, splice can be used to model both an
   * insert and a remove.  The `insert` and `remove` methods are provide a
   * simplifications.
   *
   * On a successful `splice`, one of three events will be emitted base on how
   * the method was called (and the effect change that will be made to the string
   * after any remote conflicts are resolved) as follows:
   *
   * 1. A [[StringInsertEvent]] will be emitted to any remote users if
   *    `deleteCount` equals 0 and `insertValue` is a non-empty string.
   * 2. A [[StringRemoveEvent]] will be emitted to any remote users if
   *    `deleteCount` is greater than zero and `insertValue` is an
   *    empty string.
   * 3. A [[StringSpliceEvent]] will be emitted to any remote users if
   *    `deleteCount` is greater than zero and `insertValue` is non-
   *    empty string.
   *
   * @example
   * ```typescript
   * console.log(rtString.value());      // "Hello world"
   * rtString.splice(6, 5, "everyone");
   * console.log(rtString.value());      // "Hello everyone"
   * ```
   *
   * @param index the zero-based index at which to start removing characters
   * @param deleteCount the number of characters to remove in the current string.
   * @param insertValue The value to insert at the index.
   */
  public splice(index: number, deleteCount: number, insertValue: string): void {
    this._assertWritable();
    this._string.splice(index, deleteCount, insertValue);
  }

  /**
   * Just like the `string.length` Javascript property. Returns the number of characters
   * in this string.
   *
   * ```typescript
   * rtString.value() // "Hello world"
   * rtString.length() // 11
   * ```
   */
  public length(): number {
    return this._string.length();
  }

  /////////////////////////////////////////////////////////////////////////////
  // References
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Creates an [IndexReference](LocalIndexReference) anchored to this string. Its index
   * is automatically updated on all local and remote changes.
   *
   * See the [developer guide](https://docs.convergence.io/guide/models/references/realtimestring.html)
   * for more information.
   *
   * @param key a unique name for the reference
   *
   * @returns A local index reference anchored to this string
   */
  public indexReference(key: string): LocalIndexReference {
    // fixme the index and range reference methods are almost the same.  can we refactor?
    const existing: LocalModelReference<any, any> = this._referenceManager.getLocalReference(key);
    if (existing !== undefined) {
      if (existing.reference().type() !== ModelReference.Types.INDEX) {
        throw new Error("A reference with this key already exists, but is not an index reference");
      } else {
        return existing as LocalIndexReference;
      }
    } else {
      const reference: IndexReference = new IndexReference(
        this._referenceManager, key, this,
        (this._delegate as StringNode).session().user(), (this._delegate as StringNode).session().sessionId(), true);
      const local: LocalIndexReference = new LocalIndexReference(
        reference,
        this._callbacks.referenceEventCallbacks
      );
      this._referenceManager.addLocalReference(local);
      return local;
    }
  }

  /**
   * Creates a [[LocalRangeReference]] bound to this object.  Its index bounds are
   * automatically updated on all local and remote changes.
   *
   * See the [developer guide](https://docs.convergence.io/guide/models/references/realtimestring.html)
   * for more information.
   *
   * @param key a unique name for the range reference
   *
   * @returns A local range reference anchored to this string
   */
  public rangeReference(key: string): LocalRangeReference {
    const existing: LocalModelReference<any, any> = this._referenceManager.getLocalReference(key);
    if (existing !== undefined) {
      if (existing.reference().type() !== ModelReference.Types.RANGE) {
        throw new Error("A reference with this key already exists, but is not a range reference");
      } else {
        return existing as LocalRangeReference;
      }
    } else {
      const reference: RangeReference = new RangeReference(
        this._referenceManager, key, this,
        (this._delegate as StringNode).session().user(), (this._delegate as StringNode).session().sessionId(), true);
      const local: LocalRangeReference = new LocalRangeReference(
        reference,
        this._callbacks.referenceEventCallbacks
      );
      this._referenceManager.addLocalReference(local);
      return local;
    }
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  public _handleDelegateModelEvents(event: ModelNodeEvent): void {
    if (event instanceof StringNodeInsertEvent) {
      if (event.local) {
        this._sendOperation(new StringSpliceOperation(this.id(), false, event.index, 0, event.value));
      }

      this._referenceManager.getAll().forEach((ref: ModelReference) => {
        if (ref instanceof IndexReference) {
          ref._handleInsert(event.index, event.value.length);
        } else if (ref instanceof RangeReference) {
          ref._handleInsert(event.index, event.value.length);
        }
      });
    } else if (event instanceof StringNodeRemoveEvent) {
      if (event.local) {
        this._sendOperation(new StringSpliceOperation(this.id(), false, event.index, event.value.length, ""));
      }

      this._referenceManager.getAll().forEach((ref: ModelReference) => {
        if (ref instanceof IndexReference) {
          ref._handleRemove(event.index, event.value.length);
        } else if (ref instanceof RangeReference) {
          ref._handleRemove(event.index, event.value.length);
        }
      });
    } else if (event instanceof StringNodeSpliceEvent) {
      if (event.local) {
        this._sendOperation(new StringSpliceOperation(this.id(), false, event.index, event.deleteCount, event.insertValue));
      }

      this._referenceManager.getAll().forEach((ref: ModelReference) => {
        if (ref instanceof IndexReference) {
          ref._handleSplice(event.index, event.deleteCount, event.insertValue.length);
        } else if (ref instanceof RangeReference) {
          ref._handleSplice(event.index, event.deleteCount, event.insertValue.length);
        }
      });
    } else if (event instanceof StringNodeSetValueEvent) {
      if (event.local) {
        this._sendOperation(new StringSetOperation(this.id(), false, event.value));
      }

      this._referenceManager.removeAll();
    }
  }

  /**
   * @hidden
   * @internal
   */
  private get _string(): StringNode {
    return this._delegate as StringNode;
  }
}

Object.freeze(RealTimeString.Events);
