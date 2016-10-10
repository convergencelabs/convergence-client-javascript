import {RealTimeValue} from "./RealTimeValue";
import {ReferenceManager} from "../reference/ReferenceManager";
import {ReferenceDisposedCallback} from "../reference/LocalModelReference";
import {StringNode} from "../internal/StringNode";
import {ModelEventCallbacks} from "./RealTimeModel";
import {ReferenceType} from "../reference/ModelReference";
import {LocalModelReference} from "../reference/LocalModelReference";
import {ModelReference} from "../reference/ModelReference";
import {IndexReference} from "../reference/IndexReference";
import {StringInsertOperation} from "../ot/ops/StringInsertOperation";
import {StringRemoveOperation} from "../ot/ops/StringRemoveOperation";
import {LocalIndexReference} from "../reference/LocalIndexReference";
import {LocalRangeReference} from "../reference/LocalRangeReference";
import {RangeReference} from "../reference/RangeReference";
import {ReferenceFilter} from "../reference/ReferenceFilter";
import {StringSetOperation} from "../ot/ops/StringSetOperation";
import {RemoteReferenceEvent} from "../../connection/protocol/model/reference/ReferenceEvent";
import {MessageType} from "../../connection/protocol/MessageType";
import {StringNodeInsertEvent} from "../internal/events";
import {StringNodeRemoveEvent} from "../internal/events";
import {StringNodeSetValueEvent} from "../internal/events";
import {RealTimeWrapperFactory} from "./RealTimeWrapperFactory";
import {ModelNodeEvent} from "../internal/events";
import {RealTimeModel} from "./RealTimeModel";

export class RealTimeString extends RealTimeValue<String> {

  static Events: any = {
    INSERT: "insert",
    REMOVE: "remove",
    VALUE: "value",
    DETACHED: RealTimeValue.Events.DETACHED,
    REFERENCE: RealTimeValue.Events.REFERENCE,
    MODEL_CHANGED: RealTimeValue.Events.MODEL_CHANGED
  };

  private _referenceManager: ReferenceManager;
  private _referenceDisposed: ReferenceDisposedCallback;

  /**
   * Constructs a new RealTimeString.
   */
  constructor(protected _delegate: StringNode,
              protected _callbacks: ModelEventCallbacks,
              _wrapperFactory: RealTimeWrapperFactory,
              _model: RealTimeModel) {
    super(_delegate, _callbacks, _wrapperFactory, _model);

    this._referenceManager = new ReferenceManager(this, [ReferenceType.INDEX, ReferenceType.RANGE]);
    this._referenceDisposed = (reference: LocalModelReference<any, any>) => {
      this._referenceManager.removeLocalReference(reference.key());
    };

    this._delegate.events().subscribe((event: ModelNodeEvent) => {
      if (event instanceof StringNodeInsertEvent) {
        if (event.local) {
          this._sendOperation(new StringInsertOperation(this.id(), false, event.index, event.value));
        }
        this._referenceManager.referenceMap().getAll().forEach((ref: ModelReference<any>) => {
          if (ref instanceof IndexReference) {
            ref._handleInsert(event.index, event.value.length);
          }
        });
      } else if (event instanceof StringNodeRemoveEvent) {
        if (event.local) {
          this._sendOperation(new StringRemoveOperation(this.id(), false, event.index, event.value));
        }
        this._referenceManager.referenceMap().getAll().forEach((ref: ModelReference<any>) => {
          if (ref instanceof IndexReference) {
            ref._handleRemove(event.index, event.value.length);
          }
        });
      } else if (event instanceof StringNodeSetValueEvent) {
        if (event.local) {
          this._sendOperation(new StringSetOperation(this.id(), false, event.value));
        }
        this._referenceManager.referenceMap().getAll().forEach((ref: ModelReference<any>) => {
          ref._dispose();
        });
        this._referenceManager.referenceMap().removeAll();
      }
    });
  }

  insert(index: number, value: string): void {
    this._delegate.insert(index, value);
  }

  remove(index: number, length: number): void {
    this._delegate.remove(index, length);
  }

  length(): number {
    return this._delegate.length();
  }

  /////////////////////////////////////////////////////////////////////////////
  // References
  /////////////////////////////////////////////////////////////////////////////

  // fixme the index and range reference methods are almost the same.  can we refactor?
  indexReference(key: string): LocalIndexReference {
    var existing: LocalModelReference<any, any> = this._referenceManager.getLocalReference(key);
    if (existing !== undefined) {
      if (existing.reference().type() !== ReferenceType.INDEX) {
        throw new Error("A reference with this key already exists, but is not an index reference");
      } else {
        return <LocalIndexReference>existing;
      }
    } else {
      var reference: IndexReference = new IndexReference(key, this, this._delegate.username, this._delegate.sessionId, true);

      this._referenceManager.referenceMap().put(reference);
      var local: LocalIndexReference = new LocalIndexReference(
        reference,
        this._callbacks.referenceEventCallbacks,
        this._referenceDisposed
      );
      this._referenceManager.addLocalReference(local);
      return local;
    }
  }

  rangeReference(key: string): LocalRangeReference {
    var existing: LocalModelReference<any, any> = this._referenceManager.getLocalReference(key);
    if (existing !== undefined) {
      if (existing.reference().type() !== ReferenceType.RANGE) {
        throw new Error("A reference with this key already exists, but is not a range reference");
      } else {
        return <LocalRangeReference>existing;
      }
    } else {
      var reference: RangeReference = new RangeReference(key, this, this._delegate.username, this._delegate.sessionId, true);

      this._referenceManager.referenceMap().put(reference);
      var local: LocalRangeReference = new LocalRangeReference(
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

  references(filter?: ReferenceFilter): ModelReference<any>[] {
    return this._referenceManager.referenceMap().getAll(filter);
  }

  /////////////////////////////////////////////////////////////////////////////
  // private and protected methods.
  /////////////////////////////////////////////////////////////////////////////

  _handleRemoteReferenceEvent(event: RemoteReferenceEvent): void {
    this._referenceManager.handleRemoteReferenceEvent(event);
    if (event.type === MessageType.REFERENCE_PUBLISHED) {
      var reference: ModelReference<any> = this._referenceManager.referenceMap().get(event.sessionId, event.key);
      this._fireReferenceCreated(reference);
    }
  }
}
