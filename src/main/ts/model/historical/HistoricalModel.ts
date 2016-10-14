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
import {OperationType} from "../ot/ops/OperationType";
import {AppliedCompoundOperation} from "../ot/applied/AppliedCompoundOperation";
import {AppliedDiscreteOperation} from "../ot/applied/AppliedDiscreteOperation";

export class HistoricalModel {
  private _session: Session;
  private _connection: ConvergenceConnection;

  private _modelFqn: ModelFqn;
  private _model: Model;
  private _wrapperFactory: HistoricalWrapperFactory;

  private _version: number;
  private _targetVersion: number;
  private _maxVersion: number;

  private _createdTime: Date;
  private _modifiedTime: Date;
  private _currentTime: Date;

  constructor(data: ObjectValue,
              version: number,
              modifiedTime: Date,
              createdTime: Date,
              modelFqn: ModelFqn,
              connection: ConvergenceConnection,
              session: Session) {

    this._session = session;
    this._connection = connection;

    this._modelFqn = modelFqn;
    this._model = new Model(this.session().sessionId(), this.session().username(), null, data);
    this._wrapperFactory = new HistoricalWrapperFactory();

    this._version = version;
    this._targetVersion = version;
    this._maxVersion = version;

    // todo if we can pass in a version, I suppose we need to get the time too?
    this._currentTime = modifiedTime;
    this._modifiedTime = modifiedTime;
    this._createdTime = createdTime;
  }

  session(): Session {
    return this._session;
  }

  collectionId(): string {
    return this._modelFqn.collectionId;
  }

  modelId(): string {
    return this._modelFqn.modelId;
  }

  createdTime(): Date {
    return this._createdTime;
  }

  modifiedTime(): Date {
    return this._modifiedTime;
  }

  currentTime(): Date {
    return this.currentTime();
  }

  // todo should this be currentTime?
  version(): number {
    return this._version;
  }

  targetVersion(): number {
    return this._version;
  }

  maxVersion(): number {
    return this._maxVersion;
  }

  isTransitioning(): boolean {
    return this._targetVersion === this._version;
  }

  root(): HistoricalObject {
    return <HistoricalObject> this._wrapperFactory.wrap(this._model.root());
  }

  valueAt(path: any): HistoricalValue<any> {
    return this._wrapperFactory.wrap(this._model.valueAt(path));
  }

  playTo(version: number): Promise<void> {
    let firstVersion: number;
    let lastVersion: number;

    if (version === this._targetVersion) {
      return Promise.resolve();
    } else if (version > this._targetVersion) {
      // going forwards
      firstVersion = this._targetVersion + 1;
      lastVersion = version;
    } else {
      // going backwards
      firstVersion = version + 1;
      lastVersion = this._targetVersion;
    }

    this._targetVersion = version;

    var request: HistoricalOperationsRequest = {
      type: MessageType.HISTORICAL_OPERATIONS_REQUEST,
      modelFqn: this._modelFqn,
      first: firstVersion,
      last: lastVersion
    };

    return this._connection.request(request).then((response: HistoricalOperationsResponse) => {
      // Going backwards
      if (version < this._version) {
        response.operations.reverse().forEach((op: ModelOperation) => {
          if (op.operation.type === OperationType.COMPOUND) {
            let compoundOp: AppliedCompoundOperation = <AppliedCompoundOperation> op.operation;
            compoundOp.ops.reverse().forEach((discreteOp: AppliedDiscreteOperation) => {
              this._playDiscreteOp(op, discreteOp, true);
            });
          } else {
            this._playDiscreteOp(op, <AppliedDiscreteOperation>op.operation, true);
          }
        });
      } else {
        // Going forwards
        response.operations.forEach((op: ModelOperation) => {
          if (op.operation.type === OperationType.COMPOUND) {
            let compoundOp: AppliedCompoundOperation = <AppliedCompoundOperation> op.operation;
            compoundOp.ops.forEach((discreteOp: AppliedDiscreteOperation) => {
              this._playDiscreteOp(op, discreteOp, false);
            });
          } else {
            this._playDiscreteOp(op, <AppliedDiscreteOperation>op.operation, false);
          }
        });
      }

      return; // convert to Promise<void>
    });
  }

  _playDiscreteOp(op: ModelOperation, discreteOp: AppliedDiscreteOperation, inverse: boolean): void {
    if (!discreteOp.noOp) {
      let dOp = null;
      
      if (inverse) {
        dOp = <AppliedDiscreteOperation>discreteOp.inverse();
      } else {
        dOp = discreteOp;
      }

      this._model.handleModelOperationEvent(
        new ModelOperationEvent(op.sessionId, op.username, op.version, op.timestamp, dOp));
    }

    if (inverse) {
      this._version = op.version - 1;
    } else {
      this._version = op.version;
    }
  }

  forward(delta: number = 1): Promise<void> {
    const desiredVersion: number = this._targetVersion + delta;
    return this.playTo(desiredVersion);
  }

  backward(delta: number = 1): Promise<void> {
    const desiredVersion: number = this._targetVersion - delta;
    return this.playTo(desiredVersion);
  }
}
