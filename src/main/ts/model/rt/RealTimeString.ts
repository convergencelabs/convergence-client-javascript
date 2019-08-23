import {RealTimeElement} from "./RealTimeElement";
import {StringNode} from "../internal/StringNode";
import {RealTimeModel, ModelEventCallbacks} from "./RealTimeModel";
import {
  LocalModelReference,
  ModelReference,
  IndexReference,
  LocalRangeReference,
  RangeReference
} from "../reference/";
import {StringInsertOperation} from "../ot/ops/StringInsertOperation";
import {StringRemoveOperation} from "../ot/ops/StringRemoveOperation";
import {LocalIndexReference} from "../reference/LocalIndexReference";
import {StringSetOperation} from "../ot/ops/StringSetOperation";
import {
  StringNodeInsertEvent,
  StringNodeRemoveEvent,
  StringNodeSetValueEvent,
  ModelNodeEvent
} from "../internal/events";
import {RealTimeWrapperFactory} from "./RealTimeWrapperFactory";
import {
  ObservableString,
  ObservableStringEvents,
  ObservableStringEventConstants
} from "../observable/ObservableString";
import {IdentityCache} from "../../identity/IdentityCache";

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

    (this._delegate as StringNode).events().subscribe(e => this._handleReferenceModelEvents(e));
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
    (this._delegate as StringNode).insert(index, value);
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
    ((this._delegate as StringNode) as StringNode).remove(index, length);
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
    return (this._delegate as StringNode).length();
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
  public _handleReferenceModelEvents(event: ModelNodeEvent): void {
    if (event instanceof StringNodeInsertEvent) {
      if (event.local) {
        this._sendOperation(new StringInsertOperation(this.id(), false, event.index, event.value));
      }
      this._referenceManager.getAll().forEach((ref: ModelReference<any>) => {
        if (ref instanceof IndexReference) {
          ref._handleInsert(event.index, event.value.length);
        } else if (ref instanceof RangeReference) {
          ref._handleInsert(event.index, event.value.length);
        }
      });
    } else if (event instanceof StringNodeRemoveEvent) {
      if (event.local) {
        this._sendOperation(new StringRemoveOperation(this.id(), false, event.index, event.value));
      }
      this._referenceManager.getAll().forEach((ref: ModelReference<any>) => {
        if (ref instanceof IndexReference) {
          ref._handleRemove(event.index, event.value.length);
        } else if (ref instanceof RangeReference) {
          ref._handleRemove(event.index, event.value.length);
        }
      });
    } else if (event instanceof StringNodeSetValueEvent) {
      if (event.local) {
        this._sendOperation(new StringSetOperation(this.id(), false, event.value));
      }
      this._referenceManager.getAll().forEach((ref: ModelReference<any>) => {
        ref._dispose();
      });
      this._referenceManager.removeAll();
    }
  }
}

Object.freeze(RealTimeString.Events);
