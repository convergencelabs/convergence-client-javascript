import {RealTimeElement} from "./RealTimeElement";
import {RealTimeContainerElement} from "./RealTimeContainerElement";
import {ObjectNode} from "../internal/ObjectNode";
import {RealTimeWrapperFactory} from "./RealTimeWrapperFactory";
import {RealTimeModel, ModelEventCallbacks} from "./RealTimeModel";
import {
  ModelReference,
  LocalModelReference,
  PropertyReference,
  LocalPropertyReference} from "../reference/";
import {
  ModelNodeEvent,
  ObjectNodeSetValueEvent,
  ObjectNodeRemoveEvent,
  ObjectNodeSetEvent
} from "../internal/events";
import {ModelNode} from "../internal/ModelNode";
import {DiscreteOperation} from "../ot/ops/DiscreteOperation";
import {ObjectSetPropertyOperation} from "../ot/ops/ObjectSetPropertyOperation";
import {ObjectAddPropertyOperation} from "../ot/ops/ObjectAddPropertyOperation";
import {ObjectRemovePropertyOperation} from "../ot/ops/ObjectRemovePropertyOperation";
import {ObjectSetOperation} from "../ot/ops/ObjectSetOperation";
import {ObservableObject, ObservableObjectEvents, ObservableObjectEventConstants} from "../observable/ObservableObject";
import {Path, PathElement} from "../Path";
import {IdentityCache} from "../../identity/IdentityCache";

export interface RealTimeObjectEvents extends ObservableObjectEvents {
}

export class RealTimeObject extends RealTimeElement<{ [key: string]: any; }>
  implements RealTimeContainerElement<{ [key: string]: any; }>, ObservableObject {

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

  public get(key: string): RealTimeElement<any> {
    return this._wrapperFactory.wrap((this._delegate as ObjectNode).get(key));
  }

  public set(key: string, value: any): RealTimeElement<any> {
    this._assertWritable();
    const propSet: boolean = (this._delegate as ObjectNode).hasKey(key);
    const delegateChild: ModelNode<any> = (this._delegate as ObjectNode).set(key, value);
    const operation: DiscreteOperation = propSet ?
      new ObjectSetPropertyOperation(this.id(), false, key, delegateChild.dataValue()) :
      new ObjectAddPropertyOperation(this.id(), false, key, delegateChild.dataValue());
    this._sendOperation(operation);
    return this._wrapperFactory.wrap(delegateChild);
  }

  public remove(key: string): RealTimeElement<any> {
    this._assertWritable();
    return this._wrapperFactory.wrap((this._delegate as ObjectNode).remove(key));
  }

  public keys(): string[] {
    return (this._delegate as ObjectNode).keys();
  }

  public hasKey(key: string): boolean {
    return (this._delegate as ObjectNode).hasKey(key);
  }

  public forEach(callback: (model: RealTimeElement<any>, key?: string) => void): void {
    (this._delegate as ObjectNode).forEach((modelNode, key) => {
      callback(this._wrapperFactory.wrap(modelNode), key);
    });
  }

  public elementAt(path: Path): RealTimeElement<any>;
  public elementAt(...elements: PathElement[]): RealTimeElement<any>;
  public elementAt(...path: any[]): RealTimeElement<any> {
    return this._wrapperFactory.wrap((this._delegate as ObjectNode).valueAt(...path));
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
   * @param event
   *
   * @hidden
   * @internal
   */
  private _handleReferenceEvents(event: ModelNodeEvent): void {
    if (event instanceof ObjectNodeSetValueEvent) {
      if (event.local) {
        this._sendOperation(new ObjectSetOperation(
          this.id(), false, (this._delegate as ObjectNode).dataValue().children));
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
