import {RealTimeValue} from "./RealTimeValue";
import {RealTimeContainerValue} from "./RealTimeContainerValue";
import {PathElement} from "./ot/Path";
import StringInsertOperation from "./ot/ops/StringInsertOperation";
import StringRemoveOperation from "./ot/ops/StringRemoveOperation";
import StringSetOperation from "./ot/ops/StringSetOperation";
import ModelOperationEvent from "./ModelOperationEvent";
import RealTimeValueType from "./RealTimeValueType";
import {Path} from "./ot/Path";
import {ModelChangeEvent} from "./events";
import {LocalIndexReference} from "./reference/LocalIndexReference";
import {RealTimeModel} from "./RealTimeModel";
import {LocalModelReference} from "./reference/LocalModelReference";
import {ModelReference} from "./reference/ModelReference";
import {IndexReference} from "./reference/IndexReference";
import Session from "../Session";
import {ReferenceType} from "./reference/ModelReference";
import {ModelEventCallbacks} from "./RealTimeModel";
import {IncomingReferenceEvent} from "../connection/protocol/model/reference/ReferenceEvent";
import {ReferenceManager} from "./reference/ReferenceManager";
import {OperationType} from "./ot/ops/OperationType";


export default class RealTimeString extends RealTimeValue<String> {

  static Events: any = {
    INSERT: "insert",
    REMOVE: "remove",
    VALUE: "value",
    DETACHED: RealTimeValue.Events.DETACHED,
    REFERENCE: RealTimeValue.Events.REFERENCE
  };

  private _referenceManager: ReferenceManager;
  private _data: string;

  /**
   * Constructs a new RealTimeString.
   */
  constructor(data: string,
              parent: RealTimeContainerValue<any>,
              fieldInParent: PathElement,
              callbacks: ModelEventCallbacks,
              model: RealTimeModel) {
    super(RealTimeValueType.String, parent, fieldInParent, callbacks, model);

    this._data = data;
    this._referenceManager = new ReferenceManager(this, [ReferenceType.INDEX]);
  }

  insert(index: number, value: string): void {
    this._validateInsert(index, value);

    var operation: StringInsertOperation = new StringInsertOperation(this.path(), false, index, value);
    this._data = this._data.slice(0, index) + value + this._data.slice(index, this._data.length);
    this._sendOperation(operation);

    this._referenceManager.referenceMap().getAll().forEach((ref: ModelReference) => {
      if (ref instanceof IndexReference) {
        ref.handleInsert(index, value.length);
      }
    });
  }

  remove(index: number, length: number): void {
    this._validateRemove(index, length);

    var operation: StringRemoveOperation = new StringRemoveOperation(this.path(), false, index, this._data.substr(index, length));
    this._data = this._data.slice(0, index) + this._data.slice(index + length, this._data.length);
    this._sendOperation(operation);

    this._referenceManager.referenceMap().getAll().forEach((ref: ModelReference) => {
      if (ref instanceof IndexReference) {
        ref.handleRemove(index, length);
      }
    });
  }

  length(): number {
    return this._data.length;
  }

  /////////////////////////////////////////////////////////////////////////////
  // References
  /////////////////////////////////////////////////////////////////////////////

  indexReference(key: string): LocalIndexReference {
    var existing: LocalModelReference<any> = this._referenceManager.getLocalReference(key);
    if (existing !== undefined) {
      if (existing.reference().type() !== ReferenceType.INDEX) {
        throw new Error("A reference with this key already exists, but is not an index reference");
      } else {
        return <LocalIndexReference>existing;
      }
    } else {
      var session: Session = this.model().session();
      var reference: IndexReference = new IndexReference(key, this, session.userId(), session.userId(), null);

      this._referenceManager.referenceMap().put(reference);
      var local: LocalIndexReference = new LocalIndexReference(reference, this._callbacks.referenceEventCallbacks);
      this._referenceManager.addLocalReference(local);
      return local;
    }
  }

  reference(sessionId: string, key: string): ModelReference {
    return this._referenceManager.referenceMap().get(sessionId, key);
  }

  references(sessionId?: string, key?: string): ModelReference[] {
    return this._referenceManager.referenceMap().getAll(sessionId, key);
  }

  /////////////////////////////////////////////////////////////////////////////
  // private and protected methods.
  /////////////////////////////////////////////////////////////////////////////

  protected _setValue(value: string): void {
    this._validateSet(value);

    this._data = value;
    var operation: StringSetOperation = new StringSetOperation(this.path(), false, value);
    this._sendOperation(operation);

    this._referenceManager.referenceMap().getAll().forEach((ref: ModelReference) => {
      ref._dispose();
    });
    this._referenceManager.referenceMap().removeAll();
  }

  protected _getValue(): string {
    return this._data;
  }

  //
  // Operations
  //

  _handleRemoteOperation(relativePath: Path, operationEvent: ModelOperationEvent): void {
    if (relativePath.length === 0) {
      var type: string = operationEvent.operation.type;
      if (type === OperationType.STRING_INSERT) {
        this._handleInsertOperation(operationEvent);
      } else if (type === OperationType.STRING_REMOVE) {
        this._handleRemoveOperation(operationEvent);
      } else if (type === OperationType.STRING_VALUE) {
        this._handleSetOperation(operationEvent);
      } else {
        throw new Error("Invalid operation!");
      }
    } else {
      throw new Error("Invalid path: string values do not have children");
    }
  }

  private _handleInsertOperation(operationEvent: ModelOperationEvent): void {
    var operation: StringInsertOperation = <StringInsertOperation> operationEvent.operation;
    var index: number = operation.index;
    var value: string = operation.value;

    this._validateInsert(index, value);

    this._data = this._data.slice(0, index) + value + this._data.slice(index, this._data.length);

    var event: StringInsertEvent = {
      src: this,
      name: RealTimeString.Events.INSERT,
      sessionId: operationEvent.sessionId,
      userId: operationEvent.username,
      version: operationEvent.version,
      timestamp: operationEvent.timestamp,
      index: index,
      value: value
    };
    this.emitEvent(event);

    this._referenceManager.referenceMap().getAll().forEach((ref: ModelReference) => {
      if (ref instanceof IndexReference) {
        ref.handleInsert(index, value.length);
      }
    });
  }

  private _handleRemoveOperation(operationEvent: ModelOperationEvent): void {
    var operation: StringRemoveOperation = <StringRemoveOperation> operationEvent.operation;
    var index: number = operation.index;
    var value: string = operation.value;

    this._validateRemove(index, value.length);

    this._data = this._data.slice(0, index) + this._data.slice(index + value.length, this._data.length);

    var event: StringRemoveEvent = {
      src: this,
      name: RealTimeString.Events.REMOVE,
      sessionId: operationEvent.sessionId,
      userId: operationEvent.username,
      version: operationEvent.version,
      timestamp: operationEvent.timestamp,
      index: index,
      value: value
    };
    this.emitEvent(event);

    this._referenceManager.referenceMap().getAll().forEach((ref: ModelReference) => {
      if (ref instanceof IndexReference) {
        ref.handleRemove(index, value.length);
      }
    });
  }

  private _handleSetOperation(operationEvent: ModelOperationEvent): void {
    var operation: StringSetOperation = <StringSetOperation> operationEvent.operation;
    var value: string = operation.value;

    this._validateSet(value);
    this._data = value;

    var event: StringSetValueEvent = {
      src: this,
      name: RealTimeString.Events.VALUE,
      sessionId: operationEvent.sessionId,
      userId: operationEvent.username,
      version: operationEvent.version,
      timestamp: operationEvent.timestamp,
      value: value
    };
    this.emitEvent(event);

    this._referenceManager.referenceMap().getAll().forEach((ref: ModelReference) => {
      ref._dispose();
    });
    this._referenceManager.referenceMap().removeAll();
    this._referenceManager.removeAllLocalReferences();
  }

  private _validateInsert(index: number, value: string): void {
    // TODO: Add integer check
    if (this._data.length < index || index < 0) {
      throw new Error("Index out of bounds: " + index);
    }

    if (typeof value !== "string") {
      throw new Error("Value must be a string");
    }
  }

  private _validateRemove(index: number, length: number): void {
    // TODO: Add integer check
    if (this._data.length < index + length || index < 0) {
      throw new Error("Index out of bounds!");
    }
  }

  private _validateSet(value: string): void {
    if (typeof value !== "string") {
      throw new Error("Value must be a string");
    }
  }

  _handleRemoteReferenceEvent(relativePath: Path, event: IncomingReferenceEvent): void {
    if (relativePath.length === 0) {
      this._referenceManager.handleRemoteReferenceEvent(event);
    } else {
      throw new Error("Invalid reference event. Path targeted at a child of a string.");
    }
  }
}

export interface StringInsertEvent extends ModelChangeEvent {
  src: RealTimeString;
  index: number;
  value:  string;
}

export interface StringRemoveEvent extends ModelChangeEvent {
  src: RealTimeString;
  index: number;
  value:  string;
}

export interface StringSetValueEvent extends ModelChangeEvent {
  src: RealTimeString;
  value:  string;
}
