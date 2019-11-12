/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {ConvergenceEventEmitter, IConvergenceEvent} from "../../util";
import {ModelNode} from "../internal/ModelNode";
import {Path, PathElement} from "../Path";
import {DiscreteOperation} from "../ot/ops/DiscreteOperation";
import {ModelReference, ReferenceFilter} from "../reference";
import {ModelEventCallbacks, RealTimeModel} from "./RealTimeModel";
import {RealTimeWrapperFactory} from "./RealTimeWrapperFactory";
import {RemoteReferenceCreatedEvent} from "../events";
import {ModelEventConverter} from "../ModelEventConverter";
import {NodeDetachedEvent} from "../internal/events";
import {ReferenceManager, OnRemoteReference} from "../reference/ReferenceManager";
import {
  ObservableElement,
  ObservableElementEvents,
  ObservableElementEventConstants
} from "../observable/ObservableElement";
import {RealTimeContainerElement} from "./RealTimeContainerElement";
import {filter} from "rxjs/operators";
import {ReferenceType} from "../reference/ReferenceType";
import {RemoteReferenceEvent} from "../reference/RemoteReferenceEvent";
import {IdentityCache} from "../../identity/IdentityCache";

/**
 * An enumeration of the events that could be emitted by a [[RealTimeElement]].
 *
 * @category Real Time Data Subsystem
 */
export interface RealTimeElementEvents extends ObservableElementEvents {
}

/**
 * This is an abstract representation of a particular node in a [[RealTimeModel]]'s
 * contents.  If you think of the contents of a model as a JSON tree, this could be the
 * root object, an array, or any other element. This provides utilities common to
 * all data elements, like getting the element's [[value]], a unique [[id]], its
 * [[path]] within the complete data tree, and much more.
 *
 * See the [developer guide](https://docs.convergence.io/guide/models/data/real-time-elements.html)
 * for a more in-depth analysis of the potential types of data this could wrap.
 *
 * Use [[value]] to get the current actual value of this element.
 *
 * @typeparam T The underlying javascript data type of this element.
 * For instance, T would be `number` for a [[RealTimeNumber]] and `string` for a [[RealTimeString]].
 * This is the type that [[value]] returns.
 *
 * @category Real Time Data Subsystem
 */
export abstract class RealTimeElement<T = any>
  extends ConvergenceEventEmitter<IConvergenceEvent> implements ObservableElement<T> {

  /**
   * An interface enumerating the different events that could be fired on this
   * [[RealTimeElement]].
   */
  public static readonly Events: RealTimeElementEvents = ObservableElementEventConstants;

  /**
   * @hidden
   * @internal
   */
  protected _delegate: ModelNode<T>;

  /**
   * @hidden
   * @internal
   */
  protected _callbacks: ModelEventCallbacks;

  /**
   * @hidden
   * @internal
   */
  protected _wrapperFactory: RealTimeWrapperFactory;

  /**
   * @hidden
   * @internal
   */
  protected _referenceManager: ReferenceManager;

  /**
   * @hidden
   * @internal
   */
  private readonly _model: RealTimeModel;

  /**
   * Constructs a new RealTimeElement.
   *
   * @hidden
   * @internal
   */
  protected constructor(delegate: ModelNode<T>,
                        callbacks: ModelEventCallbacks,
                        wrapperFactory: RealTimeWrapperFactory,
                        model: RealTimeModel,
                        referenceTypes: ReferenceType[],
                        identityCache: IdentityCache) {
    super();

    this._delegate = delegate;
    this._callbacks = callbacks;
    this._wrapperFactory = wrapperFactory;
    this._model = model;

    const onRemoteReference: OnRemoteReference = (ref) => {
      this._fireReferenceCreated(ref);
    };

    this._referenceManager = new ReferenceManager(this, referenceTypes, onRemoteReference, identityCache);

    this._delegate.events().pipe(filter(event => {
      return this._model.emitLocalEvents() || !event.local ||
        event instanceof NodeDetachedEvent;
    })).subscribe(event => {
      const convertedEvent: IConvergenceEvent = ModelEventConverter.convertEvent(event, this._wrapperFactory);
      this._emitEvent(convertedEvent);
    });
  }

  /**
   * Returns the model to which this element belongs.
   */
  public model(): RealTimeModel {
    return this._model;
  }

  /**
   * Each node within a [[RealTimeModel]] has a system-generated ID that is unique
   * within this model's contents.
   *
   * @returns a unique (to the model) ID for this element
   */
  public id(): string {
    return this._delegate.id();
  }

  /**
   * This element's type.  See [[ModelElementType]] for an enumeration of types.
   */
  public type(): string {
    return this._delegate.type();
  }

  /**
   * The [[Path]] representing this element's location in the containing model's data.
   * For instance, with model data
   *
   * ```json
   * {
   *   user: {
   *     age: 32
   *   }
   * }
   * ```
   *
   * The [[RealTimeNumber]] representing `32` would have path `['user', 'age']`.
   */
  public path(): Path {
    return this._delegate.path();
  }

  /**
   * Returns the parent of this element within the model.
   *
   * @returns the parent of this element, or `this` if this is the root element
   */
  public parent(): RealTimeContainerElement<any> {
    const parentPath = this._delegate.path().slice(0);
    parentPath.pop();
    const parent = this._model.elementAt(parentPath);
    return parent as any as RealTimeContainerElement<any>;
  }

  /**
   * This returns the [[PathElement]] representing this element's location relevant
   * to its parent. For example, given a model with contents
   *
   * ```json
   * {
   *   obj: {
   *     with: 1,
   *     stuff: ['a', 'string']
   *   }
   * }
   * ````
   *
   * ```typescript
   * let rtNumber = rtModel.elementAt(['obj', 'with']);
   * rtNumber.value() // 1
   * rtNumber.relativePath() // 'with'
   *
   * let rtString = rtModel.elementAt(['obj', 'stuff', 0]);
   * rtString.value() // 'a'
   * rtString.relativePath() // 0
   * ```
   *
   * @returns a PathElement representing this node's location relative to its parent,
   * or null if it has no parent.
   */
  public relativePath(): PathElement {
    const parentPath = this._delegate.path().slice(0);
    if (parentPath.length > 0) {
      return parentPath.pop();
    } else {
      return null;
    }
  }

  /**
   * A convenience function to delete this element. Throws an error if this is
   * the root object in a model.
   */
  public removeFromParent(): void {
    this._assertWritable();
    const parentPath = this._delegate.path().slice(0);

    if (parentPath.length === 0) {
      throw new Error("Can not remove the root object from the model");
    }

    const relPath = parentPath.pop();
    const parent = this._model.elementAt(parentPath) as any as RealTimeContainerElement<any>;
    parent._removeChild(relPath);
  }

  /**
   * True if the element is no longer synchronizing with the server.  See the
   * [developer guide](https://docs.convergence.io/guide/models/data/real-time-elements.html)
   * for more information.
   */
  public isDetached(): boolean {
    return this._delegate.isDetached();
  }

  /**
   * True if the element is currently set up to synchronize with the server.
   */
  public isAttached(): boolean {
    return !this._delegate.isDetached();
  }

  /**
   * Returns the current underlying value of this element.  Note that the return value
   * will not be kept up to date automatically; rather, this function will need to
   * be called each time the most up-to-date value is required.
   */
  public value(): T;

  /**
   * Sets the value of this element, whose type must be the underlying type of this
   * object.
   *
   * On a succesful `value` call, the appropriate [[IValueChangedEvent]] will be emitted
   * to any remote users. This will be one of:
   *
   * * [[ArraySetValueEvent]]
   * * [[BooleanSetValueEvent]]
   * * [[DateSetValueEvent]]
   * * [[NumberSetValueEvent]]
   * * [[ObjectSetValueEvent]]
   * * [[StringSetValueEvent]]
   *
   * @param value the new value for this object.
   */
  public value(value: T): void;
  public value(value?: T): any {
    if (arguments.length === 0) {
      return this._delegate.data();
    } else {
      this._assertWritable();
      this._delegate.data(value);
      return;
    }
  }

  /**
   * Returns a JSON-compatible representation of this element.
   */
  public toJSON(): any {
    return this._delegate.toJson();
  }

  /**
   * Returns the remote [[ModelReference]] created by the given `sessionId` with
   * the unique name `key`, or `undefined` if no such reference exists.
   *
   * See [Remote References](https://docs.convergence.io/guide/models/references/remote-references.html)
   * in the developer guide.
   *
   * @param sessionId The session ID that created the reference
   * @param key the reference's unique key
   */
  public reference(sessionId: string, key: string): ModelReference<any> {
    return this._referenceManager.get(sessionId, key);
  }

  /**
   * Returns any remote references that match the given filter.  You can provide
   * a single `key` which could return references from multiple users, `sessionId`
   * which would return all of a particular user session's references, or both,
   * which is really just the same as using the [[reference]] method.
   *
   * @param filter an object containing either a `sessionId`, `key`, or both
   *
   * @returns An array of remote [[ModelReference]]s, or an empty array if there
   * were no matches.
   */
  public references(referenceFilter?: ReferenceFilter): Array<ModelReference<any>> {
    return this._referenceManager.getAll(referenceFilter);
  }

  /**
   * @hidden
   * @internal
   */
  public _handleRemoteReferenceEvent(event: RemoteReferenceEvent): void {
    this._referenceManager.handleRemoteReferenceEvent(event);
  }

  /**
   * @hidden
   * @internal
   */
  protected _sendOperation(operation: DiscreteOperation): void {
    this._callbacks.sendOperationCallback(operation);
  }

  /**
   * @hidden
   * @internal
   */
  protected _assertWritable(): void {
    if (!this._model.permissions().write) {
      throw new Error("The user does not have write permissions for the model.");
    }
    this._assertAttached();
  }

  /**
   * @hidden
   * @internal
   */
  protected _assertAttached(): void {
    if (this.isDetached()) {
      throw Error("Can not perform actions on a detached RealTimeElement.");
    }
  }

  /**
   * @hidden
   * @internal
   */
  private _fireReferenceCreated(reference: ModelReference<any>): void {
    this._emitEvent(new RemoteReferenceCreatedEvent(reference, this.model(), this));
  }
}

Object.freeze(RealTimeElement.Events);
