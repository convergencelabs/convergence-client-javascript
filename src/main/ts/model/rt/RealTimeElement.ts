import {ConvergenceEventEmitter, IConvergenceEvent} from "../../util/";
import {ModelNode} from "../internal/ModelNode";
import {Path, PathElement} from "../Path";
import {DiscreteOperation} from "../ot/ops/DiscreteOperation";
import {ModelReference, ReferenceFilter} from "../reference/";
import {ModelEventCallbacks, RealTimeModel} from "./RealTimeModel";
import {RealTimeWrapperFactory} from "./RealTimeWrapperFactory";
import {RemoteReferenceCreatedEvent} from "../events/";
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

  public id(): string {
    return this._delegate.id();
  }

  public type(): string {
    return this._delegate.type();
  }

  public path(): Path {
    return this._delegate.path();
  }

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

  public value(): T;
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

  public toJSON(): any {
    return this._delegate.toJson();
  }

  public reference(sessionId: string, key: string): ModelReference<any> {
    return this._referenceManager.get(sessionId, key);
  }

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
