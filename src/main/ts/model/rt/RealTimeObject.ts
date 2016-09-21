import {RealTimeValue} from "./RealTimeValue";
import {RealTimeContainerValue} from "./RealTimeContainerValue";
import {ReferenceManager} from "../reference/ReferenceManager";
import {ReferenceDisposedCallback} from "../reference/LocalModelReference";
import {ObjectNode} from "../internal/ObjectNode";
import {RealTimeWrapperFactory} from "./RealTimeWrapperFactory";
import {ModelEventCallbacks} from "./RealTimeModel";
import {ReferenceType} from "../reference/ModelReference";
import {LocalModelReference} from "../reference/LocalModelReference";
import {ObjectNodeSetValueEvent} from "../internal/events";
import {ModelReference} from "../reference/ModelReference";
import {ObjectNodeRemoveEvent} from "../internal/events";
import {PropertyReference} from "../reference/PropertyReference";
import {ModelNode} from "../internal/ModelNode";
import {DiscreteOperation} from "../ot/ops/DiscreteOperation";
import {ObjectSetPropertyOperation} from "../ot/ops/ObjectSetPropertyOperation";
import {ObjectAddPropertyOperation} from "../ot/ops/ObjectAddPropertyOperation";
import {ObjectRemovePropertyOperation} from "../ot/ops/ObjectRemovePropertyOperation";
import {LocalPropertyReference} from "../reference/LocalPropertyReference";
import {ReferenceFilter} from "../reference/ReferenceFilter";
import {ObjectSetOperation} from "../ot/ops/ObjectSetOperation";
import {RemoteReferenceEvent} from "../../connection/protocol/model/reference/ReferenceEvent";
import {ObjectNodeSetEvent} from "../internal/events";
import {ModelNodeEvent} from "../internal/events";
import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {EventConverter} from "./EventConverter";

export class RealTimeObject extends RealTimeValue<{ [key: string]: any; }> implements RealTimeContainerValue<{ [key: string]: any; }> {

  static Events: any = {
    SET: "set",
    REMOVE: "remove",
    VALUE: "value",
    DETACHED: RealTimeValue.Events.DETACHED,
    MODEL_CHANGED: RealTimeValue.Events.MODEL_CHANGED
  };

  private _referenceManager: ReferenceManager;
  private _referenceDisposed: ReferenceDisposedCallback;

  /**
   * Constructs a new RealTimeObject.
   */
  constructor(protected _delegate: ObjectNode,
              protected _callbacks: ModelEventCallbacks,
              protected _wrapperFactory: RealTimeWrapperFactory) {
    super(_delegate, _callbacks, _wrapperFactory);

    this._referenceManager = new ReferenceManager(this, [ReferenceType.PROPERTY]);
    this._referenceDisposed = (reference: LocalModelReference<any, any>) => {
      this._referenceManager.removeLocalReference(reference.key());
    };

    this._delegate.events().subscribe((event: ModelNodeEvent) => {

      if (!event.local) {
        let convertedEvent: ConvergenceEvent = EventConverter.convertEvent(event, this._wrapperFactory);
        this.emitEvent(convertedEvent);
      }

      if (event instanceof ObjectNodeSetValueEvent) {
        if (event.local) {
          this._sendOperation(new ObjectSetOperation(this.id(), false, this._delegate.dataValue().children));
        }

        this._referenceManager.referenceMap().getAll().forEach((ref: ModelReference<any>) => {
          ref._dispose();
        });
        this._referenceManager.referenceMap().removeAll();
        this._referenceManager.removeAllLocalReferences();

      } else if (event instanceof ObjectNodeRemoveEvent) {
        if (event.local) {
          this._sendOperation(new ObjectRemovePropertyOperation(this.id(), false, event.key));
        }
        this._referenceManager.referenceMap().getAll().forEach((ref: ModelReference<any>) => {
          if (ref instanceof PropertyReference) {
            ref._handlePropertyRemoved(event.key);
          }
        });
      } else if (event instanceof ObjectNodeSetEvent) {
        if (event.local) {
          // Operation Handled Bellow
          // Fixme: Refactor event so we can tell if value replaced or added
        }
        this._referenceManager.referenceMap().getAll().forEach((ref: ModelReference<any>) => {
          if (ref instanceof PropertyReference) {
            ref._handlePropertyRemoved(event.key);
          }
        });
      }
    });
  }

  get(key: string): RealTimeValue<any> {
    return this._wrapperFactory.wrap(this._delegate.get(key));
  }

  set(key: string, value: any): RealTimeValue<any> {
    let propSet: boolean = this._delegate.hasKey(key);
    let delegateChild: ModelNode<any> = this._delegate.set(key, value);
    let operation: DiscreteOperation;
    if (propSet) {
      operation = new ObjectSetPropertyOperation(this.id(), false, key, delegateChild.dataValue());
    } else {
      operation = new ObjectAddPropertyOperation(this.id(), false, key, delegateChild.dataValue());
    }

    this._sendOperation(operation);
    return this._wrapperFactory.wrap(delegateChild);
  }

  remove(key: string): void {
    this._delegate.remove(key);
  }

  keys(): string[] {
    return this._delegate.keys();
  }

  hasKey(key: string): boolean {
    return this._delegate.hasKey(key);
  }

  forEach(callback: (model: RealTimeValue<any>, key?: string) => void): void {
    this._delegate.forEach((modelNode, key) => {
      callback(this._wrapperFactory.wrap(modelNode), key);
    });
  }

  valueAt(pathArgs: any): RealTimeValue<any> {
    return this._wrapperFactory.wrap(this._delegate.valueAt(pathArgs));
  }

  propertyReference(key: string): LocalPropertyReference {
    var existing: LocalModelReference<any, any> = this._referenceManager.getLocalReference(key);
    if (existing !== undefined) {
      if (existing.reference().type() !== ReferenceType.PROPERTY) {
        throw new Error("A reference with this key already exists, but is not an index reference");
      } else {
        return <LocalPropertyReference>existing;
      }
    } else {
      var reference: PropertyReference = new PropertyReference(key, this, this._delegate.username, this._delegate.sessionId, true);

      this._referenceManager.referenceMap().put(reference);
      var local: LocalPropertyReference = new LocalPropertyReference(
        reference,
        this._callbacks.referenceEventCallbacks,
        this._referenceDisposed
      );
      this._referenceManager.addLocalReference(local);
      return local;
    }
  }

  reference(sessionId: string, key: string): ModelReference<any> {
    return this._referenceManager.referenceMap().get(sessionId, key);
  }

  references(filter: ReferenceFilter): ModelReference<any>[] {
    return this._referenceManager.referenceMap().getAll(filter);
  }

  /////////////////////////////////////////////////////////////////////////////
  // Handlers for incoming operations
  /////////////////////////////////////////////////////////////////////////////

  _handleRemoteReferenceEvent(event: RemoteReferenceEvent): void {
    // fixme implement when we have object references.
    throw new Error("Objects to do have references yet.");
  }
}
