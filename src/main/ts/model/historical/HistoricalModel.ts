import {Session} from "../../Session";
import {HistoricalObject} from "./HistoricalObject";
import {HistoricalElement} from "./HistoricalElement";
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
import {ObservableModel, ObservableModelEventConstants, ObservableModelEvents} from "../observable/ObservableModel";

interface OperationRequest {
  forward: boolean;
  completed: boolean;
  operations: ModelOperation[];
}

export interface HistoricalModelEvents extends ObservableModelEvents {
  readonly TARGET_VERSION_CHANGED: string;
  readonly TRANSITION_START: string;
  readonly TRANSITION_END: string;
}

const HistoricalModelEventConstants = Object.assign({
  TARGET_VERSION_CHANGED: "target_changed",
  TRANSITION_START: "transition_start",
  TRANSITION_END: "transition_end"
}, ObservableModelEventConstants);
Object.freeze(HistoricalModelEventConstants);

export class HistoricalModel implements ObservableModel {

  public static readonly Events: HistoricalModelEvents = HistoricalModelEventConstants;

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

  private _opRequests: OperationRequest[];

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
    this._wrapperFactory = new HistoricalWrapperFactory(this);

    this._version = version;
    this._targetVersion = version;
    this._maxVersion = version;

    // todo if we can pass in a version, I suppose we need to get the time too?
    this._currentTime = modifiedTime;
    this._modifiedTime = modifiedTime;
    this._createdTime = createdTime;

    this._opRequests = [];
  }

  public session(): Session {
    return this._session;
  }

  public collectionId(): string {
    return this._modelFqn.collectionId;
  }

  public modelId(): string {
    return this._modelFqn.modelId;
  }

  public time(): Date {
    return this._currentTime;
  }

  public minTime(): Date {
    return this.createdTime();
  }

  public maxTime(): Date {
    return this._modifiedTime;
  }

  public createdTime(): Date {
    return this._createdTime;
  }

  public version(): number {
    return this._version;
  }

  public minVersion(): number {
    return 0;
  }

  public maxVersion(): number {
    return this._maxVersion;
  }

  public targetVersion(): number {
    return this._targetVersion;
  }

  public isTransitioning(): boolean {
    return this._targetVersion === this._version;
  }

  public root(): HistoricalObject {
    return <HistoricalObject> this._wrapperFactory.wrap(this._model.root());
  }

  public elementAt(path: any): HistoricalElement<any> {
    return this._wrapperFactory.wrap(this._model.valueAt(path));
  }

  public playTo(version: number): Promise<void> {
    if (version < 0) {
      throw new Error(`Version must be >= 0: ${version}`);
    } else if (version > this._maxVersion) {
      throw new Error(`Version must be <= maxVersion: ${version}`);
    }

    let firstVersion: number;
    let lastVersion: number;
    let forward: boolean = null;

    if (version === this._targetVersion) {
      return Promise.resolve();
    } else if (version > this._targetVersion) {
      // going forwards
      firstVersion = this._targetVersion + 1;
      lastVersion = version;
      forward = true;
    } else {
      // going backwards
      firstVersion = version + 1;
      lastVersion = this._targetVersion;
      forward = false;
    }

    this._targetVersion = version;

    const request: HistoricalOperationsRequest = {
      type: MessageType.HISTORICAL_OPERATIONS_REQUEST,
      modelFqn: this._modelFqn,
      first: firstVersion,
      last: lastVersion
    };

    const opRequest: OperationRequest = {
      forward,
      completed: false,
      operations: null
    };

    this._opRequests.push(opRequest);

    return this._connection.request(request).then((response: HistoricalOperationsResponse) => {
      opRequest.completed = true;
      opRequest.operations = response.operations;

      this._checkAndProcess();

      return;
    });
  }

  public forward(delta: number = 1): Promise<void> {
    if (delta < 1) {
      throw new Error("delta must be > 0");
    } else if (this._targetVersion + delta > this._maxVersion) {
      throw new Error(`Cannot move forward by ${delta}, because that would exceed the model's maxVersion.`);
    }

    const desiredVersion: number = this._targetVersion + delta;
    return this.playTo(desiredVersion);

  }

  public backward(delta: number = 1): Promise<void> {
    if (delta < 1) {
      throw new Error("delta must be > 0");
    } else if (this._targetVersion - delta < 0) {
      throw new Error(`Cannot move backawrd by ${delta}, because that would move beyond version 0.`);
    }

    const desiredVersion: number = this._targetVersion - delta;
    return this.playTo(desiredVersion);
  }

  private _checkAndProcess(): void {
    if (this._opRequests.length === 0) {
      throw new Error("There are no operation requests to process");
    }

    while (this._opRequests.length > 0 && this._opRequests[0].completed) {
      this._playOperations(this._opRequests[0].operations, this._opRequests[0].forward);
      this._opRequests.shift();
    }
  }

  private _playOperations(operations: ModelOperation[], forward: boolean): void {
    // Going backwards
    if (!forward) {
      operations.reverse().forEach((op: ModelOperation) => {
        if (op.operation.type === OperationType.COMPOUND) {
          let compoundOp: AppliedCompoundOperation = <AppliedCompoundOperation> op.operation;
          compoundOp.ops.reverse().forEach((discreteOp: AppliedDiscreteOperation) => {
            this._playDiscreteOp(op, discreteOp, true);
          });
        } else {
          this._playDiscreteOp(op, <AppliedDiscreteOperation> op.operation, true);
        }
      });
    } else {
      // Going forwards
      operations.forEach((op: ModelOperation) => {
        if (op.operation.type === OperationType.COMPOUND) {
          let compoundOp: AppliedCompoundOperation = <AppliedCompoundOperation> op.operation;
          compoundOp.ops.forEach((discreteOp: AppliedDiscreteOperation) => {
            this._playDiscreteOp(op, discreteOp, false);
          });
        } else {
          this._playDiscreteOp(op, <AppliedDiscreteOperation> op.operation, false);
        }
      });
    }
  }

  private _playDiscreteOp(op: ModelOperation, discreteOp: AppliedDiscreteOperation, inverse: boolean): void {
    if (!discreteOp.noOp) {
      let dOp: AppliedDiscreteOperation = null;

      if (inverse) {
        dOp = <AppliedDiscreteOperation> discreteOp.inverse();
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

    // fixme this is wrong.  Might be the op before.
    this._currentTime = new Date(op.timestamp);
  }
}
