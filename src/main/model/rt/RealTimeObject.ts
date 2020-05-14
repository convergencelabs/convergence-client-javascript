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
import {RealTimeContainerElement} from "./RealTimeContainerElement";
import {ObjectNode} from "../internal/ObjectNode";
import {RealTimeWrapperFactory} from "./RealTimeWrapperFactory";
import {RealTimeModel} from "./RealTimeModel";
import {
  ModelReference,
  LocalModelReference,
  PropertyReference,
  LocalPropertyReference} from "../reference";
import {
  ModelNodeEvent,
  ObjectNodeSetValueEvent,
  ObjectNodeRemoveEvent,
  ObjectNodeSetEvent
} from "../internal/events";
import {ModelNode} from "../internal/ModelNode";
import {ModelEventCallbacks} from "../internal/ModelEventCallbacks";
import {DiscreteOperation} from "../ot/ops/DiscreteOperation";
import {ObjectSetPropertyOperation} from "../ot/ops/ObjectSetPropertyOperation";
import {ObjectAddPropertyOperation} from "../ot/ops/ObjectAddPropertyOperation";
import {ObjectRemovePropertyOperation} from "../ot/ops/ObjectRemovePropertyOperation";
import {ObjectSetOperation} from "../ot/ops/ObjectSetOperation";
import {ObservableObject, ObservableObjectEvents, ObservableObjectEventConstants} from "../observable/ObservableObject";
import {Path, PathElement} from "../Path";
import {IdentityCache} from "../../identity/IdentityCache";

/**
 * @module Real Time Data
 */
export interface RealTimeObjectEvents extends ObservableObjectEvents {
}

/**
 * A distributed Object (in Javascript, a set of key-value pairs).  This extends the
 * functionality of the
 * [Javascript Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
 * prototype methods.
 *
 * See [[RealTimeObjectEvents]] for the many events that may be emitted on remote changes
 * to this underlying data of this object.
 *
 * Also see the [developer guide](https://docs.convergence.io/guide/models/data/real-time-object.html)
 * for examples of some of the most common use cases.
 *
 * @module Real Time Data
 */
export class RealTimeObject extends RealTimeElement<{ [key: string]: any; }>
  implements RealTimeContainerElement<{ [key: string]: any; }>, ObservableObject {

  /**
   * A mapping of the events this array could emit to each event's unique name.
   * Use this to refer an event name, e.g.
   *
   * ```typescript
   * rtObj.on(RealTimeObject.Events.SET, function listener(e) {
   *   // ...
   * })
   * ```
   */
  public static readonly Events: RealTimeObjectEvents = ObservableObjectEventConstants;

  /**
   * Constructs a new RealTimeObject.
   *
   * @hidden
   * @internal
   */
  constructor(delegate: ObjectNode,
              callbacks: ModelEventCallbacks,
              wrapperFactory: RealTimeWrapperFactory,
              model: RealTimeModel,
              identityCache: IdentityCache) {
    super(delegate, callbacks, wrapperFactory, model, [ModelReference.Types.PROPERTY], identityCache);

    this._delegate.events().subscribe(event => this._handleReferenceEvents(event));
  }

  /**
   * Returns the [[RealTimeElement]] at the given key.  Analogous to the object accessor
   * syntax in javascript, e.g. `users['firstName']` would be the same as `rtUsers.get('firstName')`.
   *
   * @param key the key whose value is desired
   */
  public get(key: string): RealTimeElement {
    return this._wrapperFactory.wrap((this._delegate as ObjectNode).get(key));
  }

  /**
   * Sets the given key to be the given value. An existing value at the key will
   * be replaced, otherwise a new key-value pair will be added.
   *
   * Values should be javascript primitives supported by Convergence, NOT
   * `RealTimeElements`.
   *
   * ```typescript
   * rtObject.value() // {'firstName': 'Jimbo'}
   * rtObject.set('lastName', 'McGee')
   * rtObject.value() // {'firstName': 'Jimbo', 'lastName': 'McGee'}
   * ```
   *
   * On a successful `set`, an [[ObjectSetEvent]] will be emitted for any remote users.
   *
   * @param key the key at which to place the value
   * @param value the new value, which must be a data type supported by Convergence
   *
   * @returns a [[RealTimeElement]] wrapping the newly-set `value`
   */
  public set(key: string, value: any): RealTimeElement {
    this._assertWritable();
    const propSet: boolean = (this._delegate as ObjectNode).hasKey(key);
    const delegateChild: ModelNode<any> = (this._delegate as ObjectNode).set(key, value);
    const operation: DiscreteOperation = propSet ?
      new ObjectSetPropertyOperation(this.id(), false, key, delegateChild.dataValue()) :
      new ObjectAddPropertyOperation(this.id(), false, key, delegateChild.dataValue());
    this._sendOperation(operation);
    return this._wrapperFactory.wrap(delegateChild);
  }

  /**
   * Removes the value at the given key. If the key doesn't exist, nothing happens.
   *
   * ```typescript
   * rtObject.value() // {'firstName': 'Jimbo'}
   * rtObject.remove('lastName')
   * rtObject.value() // {'firstName': 'Jimbo'}
   * let rtStr = rtObject.remove('firstName')
   * rtObject.value() // {}
   * rtStr.value() // "Jimbo"
   * rtStr.isDetached() // true
   * ```
   *
   * On a successful `remove`, an [[ObjectRemoveEvent]] will be emitted to any remote users.
   *
   * @param key The key whose value will be removed.
   *
   * @returns The RealTimeElement that *was* at `key`, in detached mode. If no `key` was
   * found, returns a [[RealTimeUndefined]].
   */
  public remove(key: string): RealTimeElement {
    this._assertWritable();
    return this._wrapperFactory.wrap((this._delegate as ObjectNode).remove(key));
  }

  /**
   * Returns an array consisting of all this object's keys. Analogous to the Javascript
   * [Object.keys](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys)
   * method.
   *
   * ```typescript
   * rtObj.value() // {'firstName': 'Jimbo', 'lastName': 'McGee'}
   * rtObj.keys() // ['firstName', 'lastName']
   * ```
   *
   * @returns an array with all of this object's keys
   */
  public keys(): string[] {
    return (this._delegate as ObjectNode).keys();
  }

  // tslint:disable:max-line-length
  /**
   * Returns true if a value exists at the given key, even if the value is `null`.
   * Analagous to the Javascript object
   * [hasOwnProperty](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty)
   * method.
   *
   * ```typescript
   * rtObj.value() // {'firstName': 'Jimbo', 'title': null}
   * rtObj.hasKey('firstName') // true
   * rtObj.hasKey('title') // true
   * rtObj.hasKey('age') // false
   * ```
   *
   * @param key the key whose existence is being requested
   *
   * @returns true if a value exists
   */
  // tslint:enable:max-line-length
  public hasKey(key: string): boolean {
    return (this._delegate as ObjectNode).hasKey(key);
  }

  /**
   * Synchronously calls the provided callback function for each key-value pair in
   * this object. Curiously, no such method is provided in native Javascript.
   *
   * ```typescript
   * rtObj.value() // {'firstName': 'Jimbo', 'lastName': 'McGee'}
   * rtObj.forEach((rtString, key) => {
   *    console.log('My', key, 'is', rtString.value())
   * })
   * // My firstName is Jimbo
   * // My lastName is McGee
   * ```
   *
   * @param callback a function to be called for each key-value pair in this object
   */
  public forEach(callback: (model: RealTimeElement, key: string) => void): void {
    (this._delegate as ObjectNode).forEach((modelNode, key) => {
      callback(this._wrapperFactory.wrap(modelNode), key);
    });
  }

  /**
   * Given a search path, returns the [[RealTimeElement]] at that path, or null if
   * no such element exists. Scoped to this object, so the first element in the given
   * path should be a string (representing an existing key)
   *
   * @param path the search path for accessing a node within this object
   *
   * @returns The [[RealTimeElement]] at the given path, or null if no such element exists
   */
  public elementAt(path: Path): RealTimeElement;
  public elementAt(...elements: PathElement[]): RealTimeElement;
  public elementAt(...path: any[]): RealTimeElement {
    return this._wrapperFactory.wrap((this._delegate as ObjectNode).valueAt(...path));
  }

  /**
   * Creates a [[LocalPropertyReference]] bound to this object.  Once it's created,
   * you can `set` the property to which the reference can be bound.
   *
   * See the [developer guide](https://docs.convergence.io/guide/models/references/realtimeobject.html)
   * for more information and examples.
   *
   * @param key a unique name for the property reference
   *
   * @returns A local property reference anchored to this object
   */
  public propertyReference(key: string): LocalPropertyReference {
    const existing: LocalModelReference<any, any> = this._referenceManager.getLocalReference(key);
    if (existing !== undefined) {
      if (existing.reference().type() !== ModelReference.Types.PROPERTY) {
        throw new Error("A reference with this key already exists, but is not an index reference");
      } else {
        return existing as LocalPropertyReference;
      }
    } else {
      const reference: PropertyReference = new PropertyReference(
        this._referenceManager, key, this, this._delegate.session().user(),
        this._delegate.session().sessionId(), true);

      const local: LocalPropertyReference = new LocalPropertyReference(
        reference,
        this._callbacks.referenceEventCallbacks
      );
      this._referenceManager.addLocalReference(local);
      return local;
    }
  }

  /**
   * @param relPath
   * @private
   * @hidden
   * @internal
   */
  public _removeChild(relPath: PathElement): void {
    if (typeof relPath !== "string") {
      throw new Error("The relative path of a child must be a string: " + (typeof relPath));
    }

    this.remove(relPath);
  }

  /**
   * @param event
   *
   * @hidden
   * @internal
   */
  private _handleReferenceEvents(event: ModelNodeEvent): void {
    if (event instanceof ObjectNodeSetValueEvent) {
      if (event.local) {
        this._sendOperation(new ObjectSetOperation(
          this.id(), false, (this._delegate as ObjectNode).dataValue().value));
      }

      this._referenceManager.getAll().forEach((ref: ModelReference<any>) => {
        ref._dispose();
      });
      this._referenceManager.removeAll();
      this._referenceManager.removeAllLocalReferences();
    } else if (event instanceof ObjectNodeRemoveEvent) {
      if (event.local) {
        this._sendOperation(new ObjectRemovePropertyOperation(this.id(), false, event.key));
      }
      this._referenceManager.getAll().forEach((ref: ModelReference<any>) => {
        if (ref instanceof PropertyReference) {
          ref._handlePropertyRemoved(event.key);
        }
      });
    } else if (event instanceof ObjectNodeSetEvent) {
      if (event.local) {
        // Operation Handled Bellow
        // Fixme: Refactor event so we can tell if delta replaced or added
      }
      this._referenceManager.getAll().forEach((ref: ModelReference<any>) => {
        if (ref instanceof PropertyReference) {
          ref._handlePropertyRemoved(event.key);
        }
      });
    }
  }
}
