import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";
import {ModelNode} from "../internal/ModelNode";
import {Path} from "../Path";
import {DiscreteOperation} from "../ot/ops/DiscreteOperation";
import {RemoteReferenceEvent} from "../../connection/protocol/model/reference/ReferenceEvent";
import {ModelReference} from "../reference/ModelReference";
import {ReferenceFilter} from "../reference/ReferenceFilter";
import {ModelEventCallbacks} from "./RealTimeModel";
import {RealTimeWrapperFactory} from "./RealTimeWrapperFactory";
import {RemoteReferenceCreatedEvent} from "../modelEvents";
import {RealTimeModel} from "./RealTimeModel";
import {ModelEventConverter} from "../ModelEventConverter";
import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {NodeDetachedEvent} from "../internal/events";
import {ReferenceManager, OnRemoteReference} from "../reference/ReferenceManager";
import {
  ObservableElement,
  ObservableElementEvents,
  ObservableElementEventConstants} from "../observable/ObservableElement";
import {RealTimeContainerElement} from "./RealTimeContainerElement";

export interface RealTimeElementEvents extends ObservableElementEvents {}

export abstract class RealTimeElement<T>
  extends ConvergenceEventEmitter<ConvergenceEvent>
  implements ObservableElement<T> {

  public static readonly Events: RealTimeElementEvents = ObservableElementEventConstants;

  protected _delegate: ModelNode<T>;
  protected _callbacks: ModelEventCallbacks;
  protected _wrapperFactory: RealTimeWrapperFactory;
  protected _referenceManager: ReferenceManager;
  private _model: RealTimeModel;

  /**
   * Constructs a new RealTimeElement.
   */
  constructor(delegate: ModelNode<T>,
              callbacks: ModelEventCallbacks,
              wrapperFactory: RealTimeWrapperFactory,
              model: RealTimeModel,
              referenceTypes: string[]) {
    super();

    this._delegate = delegate;
    this._callbacks = callbacks;
    this._wrapperFactory = wrapperFactory;
    this._model = model;

    const onRemoteReference: OnRemoteReference = (ref) => {
      this._fireReferenceCreated(ref);
    };

    this._referenceManager = new ReferenceManager(this, referenceTypes, onRemoteReference);

    this._delegate.events().filter(event => {
      return this._model.emitLocalEvents() ||
        !event.local ||
        event instanceof NodeDetachedEvent;
    }).subscribe(event => {
      let convertedEvent: ConvergenceEvent = ModelEventConverter.convertEvent(event, this._wrapperFactory);
      this._emitEvent(convertedEvent);
    });
  }

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

  public isDetached(): boolean {
    return this._delegate.isDetached();
  }

  public value(): T
  public value(value: T): void
  public value(value?: T): any {
    if (arguments.length === 0) {
      return this._delegate.data();
    } else {
      this._delegate.data(value);
      return;
    }
  }

  public toJson(): any {
    return this._delegate.toJson();
  }

  public reference(sessionId: string, key: string): ModelReference<any> {
    return this._referenceManager.get(sessionId, key);
  }

  public references(filter?: ReferenceFilter): Array<ModelReference<any>> {
    return this._referenceManager.getAll(filter);
  }

  public _handleRemoteReferenceEvent(event: RemoteReferenceEvent): void {
    this._referenceManager.handleRemoteReferenceEvent(event);
  }

  protected _sendOperation(operation: DiscreteOperation): void {
    this._exceptionIfDetached();
    this._callbacks.sendOperationCallback(operation);
  }

  private _fireReferenceCreated(reference: ModelReference<any>): void {
    this._emitEvent(new RemoteReferenceCreatedEvent(reference, this));
  }

  private _exceptionIfDetached(): void {
    if (this.isDetached()) {
      throw Error("Can not perform actions on a detached RealTimeElement.");
    }
  }
}
Object.freeze(RealTimeElement.Events);
