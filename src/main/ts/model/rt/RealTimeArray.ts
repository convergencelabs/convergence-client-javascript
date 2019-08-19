import {RealTimeElement} from "./RealTimeElement";
import {RealTimeContainerElement} from "./RealTimeContainerElement";
import {ArrayNode} from "../internal/ArrayNode";
import {RealTimeWrapperFactory} from "./RealTimeWrapperFactory";
import {RealTimeModel, ModelEventCallbacks} from "./RealTimeModel";
import {ArrayReplaceOperation} from "../ot/ops/ArrayReplaceOperation";
import {ArrayInsertOperation} from "../ot/ops/ArrayInsertOperation";
import {ArrayRemoveOperation} from "../ot/ops/ArrayRemoveOperation";
import {ArrayMoveOperation} from "../ot/ops/ArrayMoveOperation";
import {ArraySetOperation} from "../ot/ops/ArraySetOperation";
import {
  ModelNodeEvent,
  ArrayNodeInsertEvent,
  ArrayNodeRemoveEvent,
  ArrayNodeReorderEvent,
  ArrayNodeSetEvent,
  ArrayNodeSetValueEvent
} from "../internal/events";
import {ObservableArray, ObservableArrayEvents, ObservableArrayEventConstants} from "../observable/ObservableArray";
import {Path, PathElement} from "../Path";
import {RemoteReferenceEvent} from "../reference/RemoteReferenceEvent";
import {IdentityCache} from "../../identity/IdentityCache";

export interface RealTimeArrayEvents extends ObservableArrayEvents {
}

/**
 * A distributed Array. This mimics the native Javascript Array API, but has additional
 * functionality for e.g. emitting events for remote changes.
 *
 * See [[RealTimeArrayEvents]] for the events that may be emitted for remote users.
 *
 * Also see the [developer guide](https://docs.convergence.io/guide/models/data/real-time-array.html)
 * for more information.
 */
export class RealTimeArray extends RealTimeElement<any[]> implements ObservableArray, RealTimeContainerElement<any[]> {

  public static readonly Events: RealTimeArrayEvents = ObservableArrayEventConstants;

  /**
   * @hidden
   * @internal
   */
  protected _delegate: ArrayNode;

  /**
   * @hidden
   * @internal
   */
  protected _callbacks: ModelEventCallbacks;

  /**
   * Constructs a new RealTimeArray.
   *
   * @hidden
   * @internal
   */
  constructor(delegate: ArrayNode,
              callbacks: ModelEventCallbacks,
              wrapperFactory: RealTimeWrapperFactory,
              model: RealTimeModel,
              identityCache: IdentityCache) {
    super(delegate, callbacks, wrapperFactory, model, [], identityCache);

    this._delegate.events().subscribe((event: ModelNodeEvent) => {
      if (event.local) {
        if (event instanceof ArrayNodeInsertEvent) {
          this._sendOperation(new ArrayInsertOperation(this.id(), false,
            event.index, event.src.get(event.index).dataValue()));
        } else if (event instanceof ArrayNodeRemoveEvent) {
          this._sendOperation(new ArrayRemoveOperation(this.id(), false, event.index));
        } else if (event instanceof ArrayNodeReorderEvent) {
          this._sendOperation(new ArrayMoveOperation(this.id(), false, event.fromIndex, event.toIndex));
        } else if (event instanceof ArrayNodeSetEvent) {
          const index: number = event.index;
          this._sendOperation(new ArrayReplaceOperation(this.id(), false, index, event.src.get(index).dataValue()));
        } else if (event instanceof ArrayNodeSetValueEvent) {
          this._sendOperation(new ArraySetOperation(this.id(), false, event.src.dataValue().children));
        }
      }
    });
  }

  /**
   * Returns the [[RealTimeElement]] at the given index. Analogous to the array accessor
   * syntax in javascript, e.g. `users[0]` would be the same as `rtUsers.get(0)`.
   *
   * @param index the 0-based index of the desired element.
   */
  public get(index: number): RealTimeElement<any> {
    return this._wrapperFactory.wrap(this._delegate.get(index));
  }

  /**
   * Sets the given index to be the given value. An existing value at the index will
   * be replaced.  Note that unlike a javascript array, if you pass in an index
   * that doesn't yet exist, an error will be thrown. Use [[push]] or [[unshift]] to
   * add new values.
   *
   * Values should be javascript primitives supported by Convergence, NOT
   * `RealTimeElements`.
   *
   * ```typescript
   * rtArray.value() // ['red', 'green']
   * rtArray.set(1, 'yellow')
   * rtArray.value() // ['red', 'yellow']
   * rtArray.set(2, 'blue') // Error: index must be < the length of the array: 2
   * ```
   *
   * On a successful `set`, an [[ArraySetEvent]] will be emitted to any remote users.
   *
   * @param index the index at which to place the value
   * @param value the new value, which must be a data type supported by Convergence
   *
   * @returns a [[RealTimeElement]] wrapping the newly-set `value`
   */
  public set(index: number, value: any): RealTimeElement<any> {
    this._assertWritable();
    return this._wrapperFactory.wrap(this._delegate.set(index, value));
  }

  /**
   * Inserts the given value at the given index.  Analagous to the Javascript
   * `[splice](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)` function,
   * but without the second parameter. Any existing subsequent items in the array
   * will be shifted to the right.
   *
   * Values should be javascript primitives supported by Convergence, NOT
   * `RealTimeElements`.
   *
   * ```typescript
   * rtArray.value() // ['red', 'green']
   * let rtString = rtArray.insert(1, 'yellow')
   * rtArray.value() // ['red', 'yellow', 'green']
   * rtString.value() // 'yellow'
   * ```
   *
   * On a successful `insert`, an [[ArrayInsertEvent]] will be emitted to any remote users.
   *
   * @param index the index at which to insert the new value
   * @param value the new value, which must be a data type supported by Convergence
   *
   * @returns a [[RealTimeElement]] wrapping the just-inserted `value`
   */
  public insert(index: number, value: any): RealTimeElement<any> {
    this._assertWritable();
    return this._wrapperFactory.wrap(this._delegate.insert(index, value));
  }

  /**
   * Removes the value at the given index.  Any subsequent existing items in the
   * array are shifted to the left.
   *
   * ```typescript
   * rtArray.value() // ['red', 'green']
   * let rtString = rtArray.remove(0)
   * rtArray.value() // ['green']
   * rtString.value() // 'red'
   * rtString.isAttached() // false
   * ```
   *
   * On a successful `remove`, an [[ArrayRemoveEvent]] will be emitted to any remote users.
   *
   * @param index The index whose value will be removed.
   *
   * @returns The RealTimeElement that *was* at `index`, in detached mode.
   */
  public remove(index: number): RealTimeElement<any> {
    this._assertWritable();
    return this._wrapperFactory.wrap(this._delegate.remove(index));
  }

  /**
   * Moves the value at `fromIndex` to `toIndex` atomically. Other elements in the array
   * will be automatically shifted as needed. `toIndex` must be an existing index.
   *
   * ```typescript
   * rtArray.value() // ['red', 'green', 'yellow', 'blue']
   * rtArray.reorder(3, 1)
   * rtArray.value() // ['red', 'blue', 'yellow', 'green']
   * rtArray.reorder(0, 4) // Error: toIndex must be < the length of the array: 4
   * ```
   *
   * On a successful `reorder`, an [[ArrayReorderEvent]] will be emitted to any remote users.
   *
   * @param fromIndex the index whose value will be moved
   * @param toIndex the index to which this value will be moved. Must be an index with
   *                an existing value.
   */
  public reorder(fromIndex: number, toIndex: number): void {
    this._assertWritable();
    this._delegate.reorder(fromIndex, toIndex);
  }

  /**
   * Appends the given value to this Array.  Analagous to the javascript
   * [array.push](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push)
   * method.
   *
   * ```typescript
   * rtArray.value() // ['red', 'green']
   * rtArray.push('yellow')
   * rtArray.value() // ['red', 'green', 'yellow']
   * ```
   *
   * On a successful `push`, an [[ArrayInsertEvent]] will be emitted to any remote users.
   *
   * @param value the new value, which must be a data type supported by Convergence
   *
   * @returns a `RealTimeElement` wrapping the newly-inserted value.
   */
  public push(value: any): RealTimeElement<any> {
    this._assertWritable();
    return this._wrapperFactory.wrap(this._delegate.push(value));
  }

  /**
   * Removes and returns the last value in this [[RealTimeArray]].  Analagous to the javascript
   * [array.pop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/pop)
   * method.
   *
   * ```typescript
   * rtArray.value() // ['red', 'green']
   * let rtString = rtArray.pop()
   * rtArray.value() // ['red']
   * rtString.value() // 'green'
   * rtString.isDetached() // true
   * ```
   *
   * On a successful `pop`, an [[ArrayRemoveEvent]] will be emitted to any remote users.
   *
   * @returns a `RealTimeElement` wrapping the just-removed value, in detached mode.
   */
  public pop(): RealTimeElement<any> {
    this._assertWritable();
    return this._wrapperFactory.wrap(this._delegate.pop());
  }

  /**
   * Inserts a value to the beginning of this [[RealTimeArray]].  Analagous to the javascript
   * [array.unshift](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/unshift)
   * method.
   *
   * ```typescript
   * rtArray.value() // ['red', 'green']
   * let rtString = rtArray.unshift('yellow')
   * rtArray.value() // ['yellow', 'red', 'green']
   * rtString.value() // 'yellow'
   * ```
   *
   * On a successful `unshift`, an [[ArrayInsertEvent]] will be emitted to any remote users.
   *
   * @returns a `RealTimeElement` wrapping the just-inserted value
   */
  public unshift(value: any): RealTimeElement<any> {
    this._assertWritable();
    return this._wrapperFactory.wrap(this._delegate.unshift(value));
  }

  /**
   * Removes and returns the first value in this [[RealTimeArray]].  Analagous to the javascript
   * [array.shift](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/shift)
   * method.
   *
   * ```typescript
   * rtArray.value() // ['red', 'green']
   * let rtString = rtArray.shift()
   * rtArray.value() // ['green']
   * rtString.value() // 'red'
   * rtString.isDetached() // true
   * ```
   *
   * On a successful `shift`, an [[ArrayRemoveEvent]] will be emitted to any remote users.
   *
   * @returns a `RealTimeElement` wrapping the just-removed value, in detached mode.
   */
  public shift(): RealTimeElement<any> {
    this._assertWritable();
    return this._wrapperFactory.wrap(this._delegate.shift());
  }

  /**
   * Returns the total count of items in this array.
   *
   * ```typescript
   * rtArray.value() // ['red', 'green']
   * rtArray.length() // 2
   * ```
   */
  public length(): number {
    return this._delegate.length();
  }

  /**
   * Tests if there exists at least one item which passes the provided test function.
   * Analagous to the javascript
   * [array.some](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some) method.
   *
   * ```typescript
   * rtArray.value() // ['red', 'green']
   * let matched = rtArray.some((rtString) => {
   *    return rtString.value().startsWith('r');
   * })
   * console.log(matched) // true
   * ```
   *
   * @param callback a test function returning a truthy value
   *
   * @returns true if there was at least item in this array for which the given function
   * test passed.
   */
  public some(callback: (element: RealTimeElement<any>, index?: number) => boolean): boolean {
    return this._delegate.some((modelNode, index) => {
      return callback(this._wrapperFactory.wrap(modelNode), index);
    });
  }

  /**
   * Returns true if *every* item in this array passes the provided test function.
   * Analagous to the javascript
   * [array.every](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every) method.
   *
   * ```typescript
   * rtArray.value() // ['red', 'green']
   * let allMatched = rtArray.every(rtString => {
   *    return rtString.value().startsWith('r');
   * })
   * console.log(allMatched) // false
   *
   * allMatched = rtArray.every(rtString => {
   *    return rtString.length() > 2;
   * })
   * console.log(allMatched) // true
   * ```
   *
   * @param callback a test function returning a truthy value
   *
   * @returns true if every item in the array passes the provided test function
   */
  public every(callback: (element: RealTimeElement<any>, index?: number) => boolean): boolean {
    return this._delegate.every((modelNode, index) => {
      return callback(this._wrapperFactory.wrap(modelNode), index);
    });
  }

  /**
   * Returns the first item in this array that passes the provided test function.
   * Analagous to the javascript
   * [array.find](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find) method.
   *
   * ```typescript
   * rtArray.value() // ['red', 'green']
   * let match = rtArray.find(rtString => {
   *    return rtString.value().startsWith('g');
   * })
   * match.value() // false
   *
   * match = rtArray.find(rtString => {
   *    return rtString.length() < 3;
   * })
   * console.log(match) // undefined
   * ```
   *
   * @param callback a test function returning a truthy value
   *
   * @returns a [[RealTimeElement]] wrapping the first item that passed the provided
   * test function, or `undefined` if there were no matches.
   */
  public find(callback: (element: RealTimeElement<any>, index?: number) => boolean): RealTimeElement<any> {
    const node = this._delegate.find((modelNode, index) => {
      return callback(this._wrapperFactory.wrap(modelNode), index);
    });

    if (node === undefined) {
      return undefined;
    } else {
      return this._wrapperFactory.wrap(node);
    }
  }

  public findIndex(callback: (element: RealTimeElement<any>, index?: number) => boolean): number {
    return this._delegate.findIndex((modelNode, index) => {
      return callback(this._wrapperFactory.wrap(modelNode), index);
    });
  }

  public forEach(callback: (value: RealTimeElement<any>, index?: number) => void): void {
    this._delegate.forEach((modelNode, index) => {
      callback(this._wrapperFactory.wrap(modelNode), index);
    });
  }

  public elementAt(path: Path): RealTimeElement<any>;
  public elementAt(...elements: PathElement[]): RealTimeElement<any>;
  public elementAt(...path: any[]): RealTimeElement<any> {
    return this._wrapperFactory.wrap(this._delegate.valueAt(...path));
  }

  /**
   * @param relPath
   * @private
   * @internal
   * @hidden
   */
  public _removeChild(relPath: PathElement): void {
    if (typeof relPath !== "number") {
      throw new Error("The relative path of a child must be a number: " + (typeof relPath));
    }

    this.remove(relPath);
  }

  /**
   * @param event
   * @private
   * @internal
   * @hidden
   */
  public _handleRemoteReferenceEvent(event: RemoteReferenceEvent): void {
    throw new Error("Arrays to do have references yet.");
  }
}
