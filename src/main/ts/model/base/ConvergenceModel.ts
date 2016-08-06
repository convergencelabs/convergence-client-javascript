import {ModelFqn} from "../ModelFqn";
import {Session} from "../../Session";
import {DiscreteOperation} from ".././ot/ops/DiscreteOperation";
import {ProcessedOperationEvent} from ".././ot/ProcessedOperationEvent";
import {ModelOperationEvent} from ".././ModelOperationEvent";
import {CompoundOperation} from ".././ot/ops/CompoundOperation";
import {Operation} from ".././ot/ops/Operation";
import {MessageType} from "../../connection/protocol/MessageType";
import {ForceCloseRealTimeModel} from "../../connection/protocol/model/forceCloseRealtimeModel";
import {MessageEvent} from "../../connection/ConvergenceConnection";
import {RemoteOperation} from "../../connection/protocol/model/remoteOperation";
import {Path} from ".././ot/Path";
import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";
import {ModelReferenceCallbacks} from ".././reference/LocalModelReference";
import {OperationType} from ".././ot/ops/OperationType";
import {SessionIdParser} from "../../connection/protocol/SessionIdParser";
import {ObjectValue} from ".././dataValue";
import {ConvergenceValueFactory} from "./ConvergenceValueFactory";
import {ConvergenceObject} from "./ConvergneceObject";
import {ConvergenceValue} from "./ConvergenceValue";

export abstract class ConvergenceModel extends ConvergenceEventEmitter {

  static Events: any = {
    CLOSED: "closed",
    DELETED: "deleted",
    MODIFIED: "modified",
    COMMITTED: "committed",
    VERSION_CHANGED: "version_changed",
    SESSION_OPENED: "session_opened",
    SESSION_CLOSED: "session_closed"
  };

  private _data: ConvergenceObject;
  private _open: boolean;
  private _idToValue: {[key: string]: ConvergenceValue<any>};
  private _valueFactory: ConvergenceValueFactory;

  constructor(data: ObjectValue,
              private _version: number,
              private _createdTime: Date,
              private _modifiedTime: Date,
              private _modelFqn: ModelFqn) {
    super();

    this._valueFactory = new ConvergenceValueFactory(this);
    this._idToValue = {};
    this._data = new ConvergenceObject(data, null, null, this._valueFactory, this);
    this._open = true;
  }

  collectionId(): string {
    return this._modelFqn.collectionId;
  }

  modelId(): string {
    return this._modelFqn.modelId;
  }

  version(): number {
    return this._version;
  }

  createdTime(): Date {
    return this._createdTime;
  }

  modifiedTime(): Date {
    return this._modifiedTime;
  }

  data(): ConvergenceObject {
    return this._data;
  }

  dataAt(path: any): ConvergenceValue<any> {
    var pathArgs: Path = Array.isArray(path) ? path : arguments;
    return this._data._path(pathArgs);
  }

  abstract session(): Session;


  abstract close(): Promise<void>

  isOpen(): boolean {
    return this._open;
  }


  //
  // Private API
  //

  _registerValue(value: ConvergenceValue<any>): void {
    this._idToValue[value.id()] = value;
  }

  _unregisterValue(value: ConvergenceValue<any>): void {
    delete this._idToValue[value.id()];
  }


  _handleMessage(messageEvent: MessageEvent): void {
    switch (messageEvent.message.type) {
      case MessageType.FORCE_CLOSE_REAL_TIME_MODEL:
        this._handleForceClose(<ForceCloseRealTimeModel>messageEvent.message);
        break;
      case MessageType.REMOTE_OPERATION:
        this._handleRemoteOperation(<RemoteOperation>messageEvent.message);
        this._emitVersionChanged();
        break;
      default:
        throw new Error("Unexpected message");
    }
  }

  private _handleForceClose(message: ForceCloseRealTimeModel): void {
    var event: RealTimeModelClosedEvent = {
      src: this,
      name: ConvergenceModel.Events.CLOSED,
      local: false,
      reason: message.reason
    };
    this._close(event);
  }

  private _close(event: RealTimeModelClosedEvent): void {
    this._data._detach();
    this._open = false;
    this.emitEvent(event);
  }

  protected _handleRemoteOperation(message: RemoteOperation): void {
    var processed: ProcessedOperationEvent = new ProcessedOperationEvent( message.sessionId,
      -1, // fixme not needed, this is only needed when going to the server.  Perhaps
      // this should probalby go in the op submission message.
      message.version,
      message.timestamp,
      message.operation);

    var username: string = SessionIdParser.parseUsername(message.sessionId);

    this._applyOperation(processed, username);
  }

  protected _applyOperation(processed: ProcessedOperationEvent, username: string): void {
    var operation: Operation = processed.operation;
    var clientId: string = processed.clientId;
    var contextVersion: number = processed.version;
    var timestamp: number = processed.timestamp;


    this._version = contextVersion + 1;
    this._modifiedTime = new Date(timestamp);

    if (operation.type === OperationType.COMPOUND) {
      var compoundOp: CompoundOperation = <CompoundOperation> operation;
      compoundOp.ops.forEach((op: DiscreteOperation) => {
        var modelEvent: ModelOperationEvent = new ModelOperationEvent(clientId, username, contextVersion, timestamp, op);
        this._deliverToChild(modelEvent);
      });
    } else {
      var modelEvent: ModelOperationEvent =
        new ModelOperationEvent(clientId, username, contextVersion, timestamp, <DiscreteOperation> operation);
      this._deliverToChild(modelEvent);
    }
  }

  private _deliverToChild(modelEvent: ModelOperationEvent): void {
    var child: ConvergenceValue<any> = this._idToValue[modelEvent.operation.id];
    if (child) {
      child._handleRemoteOperation(modelEvent);
    }
  }

  private _emitVersionChanged(): void {
    var event: VersionChangedEvent = {
      name: ConvergenceModel.Events.VERSION_CHANGED,
      src: this,
      version: this._version
    };
    this.emitEvent(event);
  }
}

Object.freeze(ConvergenceModel.Events);

export interface ModelEventCallbacks {
  sendOperationCallback: (operation: DiscreteOperation) => void;
  referenceEventCallbacks: ModelReferenceCallbacks;
}

export interface ConvergenceModelEvent extends ConvergenceEvent {
  src: ConvergenceModel;
}

export interface RealTimeModelClosedEvent extends ConvergenceModelEvent {
  local: boolean;
  reason?: string;
}

export interface VersionChangedEvent extends ConvergenceModelEvent {
  version: number;
}

export interface ValueDetachedEvent extends ConvergenceModelEvent {
  value: ConvergenceValue<any>;
}
