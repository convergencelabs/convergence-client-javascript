import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";
import {ModelNode} from "../internal/ModelNode";
import {ModelValueType} from "../ModelValueType";
import {Path} from "../ot/Path";
import {DiscreteOperation} from "../ot/ops/DiscreteOperation";
import {RemoteReferenceEvent} from "../../connection/protocol/model/reference/ReferenceEvent";
import {ModelReference} from "../reference/ModelReference";
import {ReferenceFilter} from "../reference/ReferenceFilter";
import {ModelEventCallbacks} from "./RealTimeModel";
import {RealTimeWrapperFactory} from "./RealTimeWrapperFactory";
import {RemoteReferenceCreatedEvent} from "./events";
import {RealTimeModel} from "./RealTimeModel";
import {EventConverter} from "./EventConverter";
import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {NodeDetachedEvent} from "../internal/events";
import {ReferenceManager, OnRemoteReference} from "../reference/ReferenceManager";

export abstract class RealTimeValue<T> extends ConvergenceEventEmitter<ConvergenceEvent> {

  static Events: any = {
    DETACHED: "detached",
    REFERENCE: "reference",
    MODEL_CHANGED: "model_changed"
  };

  protected _delegate: ModelNode<T>;
  protected _callbacks: ModelEventCallbacks;
  protected _wrapperFactory: RealTimeWrapperFactory;
  protected _referenceManager: ReferenceManager;
  private _model: RealTimeModel;

  /**
   * Constructs a new RealTimeValue.
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
      let convertedEvent: ConvergenceEvent = EventConverter.convertEvent(event, this._wrapperFactory);
      this._emitEvent(convertedEvent);
    });
  }

  model(): RealTimeModel {
    return this._model;
  }

  id(): string {
    return this._delegate.id();
  }

  type(): ModelValueType {
    return this._delegate.type();
  }

  path(): Path {
    return this._delegate.path();
  }

  isDetached(): boolean {
    return this._delegate.isDetached();
  }

  data(): T
  data(value: T): void
  data(value?: T): any {
    if (arguments.length === 0) {
      return this._delegate.data();
    } else {
      this._delegate.data(value);
      return;
    }
  }

  reference(sessionId: string, key: string): ModelReference<any> {
    return this._referenceManager.get(sessionId, key);
  }

  references(filter?: ReferenceFilter): ModelReference<any>[] {
    return this._referenceManager.getAll(filter);
  }

  _handleRemoteReferenceEvent(event: RemoteReferenceEvent): void {
    this._referenceManager.handleRemoteReferenceEvent(event);
  }

  protected _sendOperation(operation: DiscreteOperation): void {
    this._exceptionIfDetached();
    this._callbacks.sendOperationCallback(operation);
  }

  private _fireReferenceCreated(reference: ModelReference<any>): void {
    var createdEvent: RemoteReferenceCreatedEvent = {
      name: RealTimeValue.Events.REFERENCE,
      src: this,
      reference: reference
    };
    this._emitEvent(createdEvent);
  }

  private _exceptionIfDetached(): void {
    if (this.isDetached()) {
      throw Error("Can not perform actions on a detached RealTimeValue.");
    }
  }
}
