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

export abstract class RealTimeValue<T> extends ConvergenceEventEmitter {

  static Events: any = {
    DETACHED: "detached",
    REFERENCE: "reference",
    MODEL_CHANGED: "model_changed"
  };

  /**
   * Constructs a new RealTimeValue.
   */
  constructor(protected _delegate: ModelNode<T>,
              protected _callbacks: ModelEventCallbacks,
              protected _wrapperFactory: RealTimeWrapperFactory) {
    super();
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

  private _exceptionIfDetached(): void {
    if (this.isDetached()) {
      throw Error("Can not perform actions on a detached RealTimeValue.");
    }
  }

  protected _sendOperation(operation: DiscreteOperation): void {
    this._exceptionIfDetached();
    this._callbacks.sendOperationCallback(operation);
  }


  abstract _handleRemoteReferenceEvent(referenceEvent: RemoteReferenceEvent): void;

  reference(sessionId: string, key: string): ModelReference<any> {
    return;
  }

  references(filter?: ReferenceFilter): ModelReference<any>[] {
    return;
  }

  protected _fireReferenceCreated(reference: ModelReference<any>): void {
    var createdEvent: RemoteReferenceCreatedEvent = {
      name: RealTimeValue.Events.REFERENCE,
      src: this,
      reference: reference
    };
    this.emitEvent(createdEvent);
  }
}
