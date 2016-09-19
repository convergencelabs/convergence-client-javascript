import {Session} from "../../Session";
import {HistoricalObject} from "./HistoricalObject";
import {HistoricalValue} from "./HistoricalValue";
import {ModelFqn} from "../ModelFqn";
import {Model} from "../internal/Model";
import {ObjectValue} from "../dataValue";
import {HistoricalWrapperFactory} from "./HistoricalWrapperFactory";
import {ConvergenceConnection} from "../../connection/ConvergenceConnection";
import {HistoricalOperationsRequest} from "../../connection/protocol/model/historical/historicalOperationsRequest";
import {MessageType} from "../../connection/protocol/MessageType";
import {HistoricalOperationsResponse} from "../../connection/protocol/model/historical/historicalOperationsRequest";
import {ModelOperation} from "../ot/applied/ModelOperation";
import {ModelOperationEvent} from "../ModelOperationEvent";
import {DiscreteOperation} from "../ot/ops/DiscreteOperation";

export class HistoricalModel {

  private _maxVersion: number;
  private _version: number;
  private _modifiedTime: Date;
  private _model: Model;
  private _wrapperFactory: HistoricalWrapperFactory;

  constructor(data: ObjectValue,
              version: number,
              modifiedTime: Date,
              private _createdTime: Date,
              private _modelFqn: ModelFqn,
              private _connection: ConvergenceConnection,
              private _session: Session) {

    this._maxVersion = version;
    this._version = version;
    this._modifiedTime = modifiedTime;
    this._model = new Model(this.session().sessionId(), this.session().username(), null, data);
    this._wrapperFactory = new HistoricalWrapperFactory();
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

  maxVersion(): number {
    return this._maxVersion;
  }

  root(): HistoricalObject {
    return <HistoricalObject> this._wrapperFactory.wrap(this._model.root());
  }

  goto(version: number): Promise<void> {
    let gotoVersion: number;
    let limit: number;

    if (version === this._version) {
      return Promise.resolve();
    } else if (version > this._version) {
      gotoVersion = this._version;
      limit = version - this._version;
    } else {
      gotoVersion = version;
      limit = this._version - version;
    }

    var request: HistoricalOperationsRequest = {
      type: MessageType.HISTORICAL_OPERATIONS_REQUEST,
      modelFqn: this._modelFqn,
      version: gotoVersion,
      limit: limit
    };

    return this._connection.request(request).then((response: HistoricalOperationsResponse) => {
      if (version < this._version) {
        response.operations.reverse().forEach((op: ModelOperation) => {
          this._model.handleModelOperationEvent(
            new ModelOperationEvent(op.sessionId, op.username, op.version, op.timestamp,
              <DiscreteOperation><any>op.operation.inverse()));
        });
      } else {
        response.operations.forEach((op: ModelOperation) => {
          this._model.handleModelOperationEvent(
            new ModelOperationEvent(op.sessionId, op.username, op.version, op.timestamp,
              <DiscreteOperation><any>op.operation));
        });
      }

      return; // convert to Promise<void>
    });
  }

  forward(delta: number = 1): Promise<void> {
    var request: HistoricalOperationsRequest = {
      type: MessageType.HISTORICAL_OPERATIONS_REQUEST,
      modelFqn: this._modelFqn,
      version: this._version,
      limit: delta
    };

    return this._connection.request(request).then((response: HistoricalOperationsResponse) => {
      response.operations.forEach((op: ModelOperation) => {
        this._model.handleModelOperationEvent(
          new ModelOperationEvent(op.sessionId, op.username, op.version, op.timestamp,
            <DiscreteOperation><any>op.operation));
      });

      return; // convert to Promise<void>
    });
  }

  backward(delta: number = 1): Promise<void> {
    var request: HistoricalOperationsRequest = {
      type: MessageType.HISTORICAL_OPERATIONS_REQUEST,
      modelFqn: this._modelFqn,
      version: this._version - delta,
      limit: delta
    };

    return this._connection.request(request).then((response: HistoricalOperationsResponse) => {
      response.operations.reverse().forEach((op: ModelOperation) => {
        this._model.handleModelOperationEvent(
          new ModelOperationEvent(op.sessionId, op.username, op.version, op.timestamp,
            <DiscreteOperation><any>op.operation.inverse()));
      });

      return; // convert to Promise<void>
    });
  }

  createdTime(): Date {
    return this._createdTime;
  }

  modifiedTime(): Date {
    return this._modifiedTime;
  }

  valueAt(path: any): HistoricalValue<any> {
    return this._wrapperFactory.wrap(this._model.valueAt(path));
  }

  session(): Session {
    return this._session;
  }
}
