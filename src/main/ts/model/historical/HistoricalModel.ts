import {ConvergenceSession} from "../../ConvergenceSession";
import {HistoricalObject} from "./HistoricalObject";
import {HistoricalElement} from "./HistoricalElement";
import {Model} from "../internal/Model";
import {ObjectValue} from "../dataValue";
import {HistoricalWrapperFactory} from "./HistoricalWrapperFactory";
import {ConvergenceConnection} from "../../connection/ConvergenceConnection";
import {ModelOperation} from "../ot/applied/ModelOperation";
import {ModelOperationEvent} from "../ModelOperationEvent";
import {OperationType} from "../ot/ops/OperationType";
import {AppliedCompoundOperation} from "../ot/applied/AppliedCompoundOperation";
import {AppliedDiscreteOperation} from "../ot/applied/AppliedDiscreteOperation";
import {ObservableModel, ObservableModelEventConstants, ObservableModelEvents} from "../observable/ObservableModel";
import {Path, PathElement} from "../Path";
import {io} from "@convergence-internal/convergence-proto";
import IConvergenceMessage = io.convergence.proto.IConvergenceMessage;
import {toModelOperation} from "./ModelOperationMapper";
import {IdentityCache} from "../../identity/IdentityCache";
import {getOrDefaultArray} from "../../connection/ProtocolUtil";

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

const HistoricalModelEventConstants = {
  ...ObservableModelEventConstants,
  TARGET_VERSION_CHANGED: "target_changed",
  TRANSITION_START: "transition_start",
  TRANSITION_END: "transition_end"
};
Object.freeze(HistoricalModelEventConstants);

/**
 * This is an alternate read-only representation of a particular [[RealTimeModel]] that
 * allows for the introspection of the model's contents at particular points
 * in time. History can only be traversed by version ID, but the timestamp associated
 * with a particular version is available when this model has been "played" to that
 * version.
 *
 * The [[backward]], [[forward]], and [[playTo]] methods are the means for "playing" the
 * model to a particular version or version offset.
 *
 * Just like in a [[RealTimeModel]], you can use the [[root]] and [[elementAt]] methods
 * to access the data associated with this model's "current" version. Note that these
 * return a read-only [[HistoricalObject]] or [[HistoricalElement]] respectively.
 *
 * See the [developer guide](https://docs.convergence.io/guide/models/history.html) 
 * for some examples and additional information.
 */
export class HistoricalModel implements ObservableModel {

  public static readonly Events: HistoricalModelEvents = HistoricalModelEventConstants;

  /**
   * @internal
   */
  private readonly _session: ConvergenceSession;

  /**
   * @internal
   */
  private readonly _connection: ConvergenceConnection;

  /**
   * @internal
   */
  private readonly _modelId: string;

  /**
   * @internal
   */
  private readonly _collectionId: string;

  /**
   * @internal
   */
  private readonly _model: Model;

  /**
   * @internal
   */
  private readonly _wrapperFactory: HistoricalWrapperFactory;

  /**
   * @internal
   */
  private _version: number;

  /**
   * @internal
   */
  private _targetVersion: number;

  /**
   * @internal
   */
  private readonly _maxVersion: number;

  /**
   * @internal
   */
  private readonly _createdTime: Date;

  /**
   * @internal
   */
  private readonly _modifiedTime: Date;

  /**
   * @internal
   */
  private _currentTime: Date;

  /**
   * @internal
   */
  private _opRequests: OperationRequest[];

  /**
   * @internal
   */
  private _identityCache: IdentityCache;

  /**
   * @hidden
   * @internal
   */
  constructor(data: ObjectValue,
              version: number,
              modifiedTime: Date,
              createdTime: Date,
              modelId: string,
              collectionId: string,
              connection: ConvergenceConnection,
              session: ConvergenceSession,
              identityCache: IdentityCache) {

    this._session = session;
    this._connection = connection;
    this._identityCache = identityCache;

    this._modelId = modelId;
    this._collectionId = collectionId;
    this._model = new Model(this.session(), null, data);
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

  /**
   * The session attached to the currently-active domain.
   */
  public session(): ConvergenceSession {
    return this._session;
  }

  /**
   * The model's collection ID
   */
  public collectionId(): string {
    return this._collectionId;
  }

  /**
   * The model's unique ID
   */
  public modelId(): string {
    return this._modelId;
  }

  /**
   * The timestamp at which the current (played to) version was created. This can be
   * used to determine the timestamp associated with a particular version of this model.
   * For example:
   *
   * ```typescript
   * historicalModel.version() // 433
   * historicalModel.time() // "Fri Aug 16 2019 11:49:19 GMT-0600"
   * historicalModel.playTo(410)
   *   .then(() => {
   *     historicalModel.version() // 410
   *     historicalModel.time() // "Fri Aug 16 2019 11:44:36 GMT-0600"
   *
   *     return historicalModel.playTo(1);
   *   })
   *   .then(() => {
   *     // this is the timestamp at which the model was created
   *     historicalModel.time() // "Wed Aug 14 2019 13:51:01 GMT-0600"
   *   })
   * ```
   *
   * @returns the timestamp associated with this model's current version
   */
  public time(): Date {
    return this._currentTime;
  }

  /**
   * The oldest timestamp associated with this model.  This is just an alias for [[createdTime]]
   */
  public minTime(): Date {
    return this.createdTime();
  }

  /**
   * The most recent timestamp at which this model was modified
   */
  public maxTime(): Date {
    return this._modifiedTime;
  }

  /**
   * The timestamp at which this model was created
   */
  public createdTime(): Date {
    return this._createdTime;
  }

  /**
   * The current version of this model.  E.g.
   *
   * ```typescript
   * historicalVersion.maxVersion() // 433
   * historicalModel.version() // 433
   * historicalModel.playTo(410)
   *   .then(() => {
   *     historicalModel.version() // 410
   *
   *     return historicalModel.playTo(1);
   *   })
   *   .then(() => {
   *     historicalModel.version() // 1
   *   })
   * ```
   */
  public version(): number {
    return this._version;
  }

  /**
   * The oldest version of this model.  Versions are 0-based, so this will just return `0`.
   */
  public minVersion(): number {
    return 0;
  }

  /**
   * The most recent version of this model.  Equivalent to [[RealTimeModel.version]]
   */
  public maxVersion(): number {
    return this._maxVersion;
  }

  /**
   * This is the "desired" version of this model. During the period when the model
   * is in the process of playing back, this returns the targeted version.  Otherwise
   * it represents the current version.
   *
   * ```typescript
   * historicalModel.version() // 433
   * historicalModel.targetVersion() // 433
   * historicalModel.playTo(1)
   *   .then(() => {
   *     historicalModel.version() // 1
   *   })
   * historicalModel.targetVersion() // 1
   * historicalModel.version() // 433, because `playTo` is async
   * ```
   */
  public targetVersion(): number {
    return this._targetVersion;
  }

  /**
   * Returns true when the model is in the process of playing to a particular version:
   *
   * ```typescript
   * historicalModel.version() // 433
   * historicalModel.isTransitioning() // false
   * historicalModel.playTo(1)
   *   .then(() => {
   *     historicalModel.version() // 1
   *     historicalModel.isTransitioning() // false
   *   })
   * historicalModel.isTransitioning() // true
   * ```
   *
   * @returns true if this model is in the process of playing to a particular version
   */
  public isTransitioning(): boolean {
    return this._targetVersion === this._version;
  }

  /**
   * Returns the entire contents of this model at the current [[version]].  Calling
   * this while `isTransitioning === true` may have an indeterminate result and should
   * be avoided.
   *
   * See also [[RealTimeModel.root]]
   *
   * @returns the entire contents of this model at the current version as a [[HistoricalObject]]
   */
  public root(): HistoricalObject {
    return this._wrapperFactory.wrap(this._model.root()) as HistoricalObject;
  }

  /**
   * Given a search path, returns a read-only representation of the element at
   * that path at the current played-to version, or null if no such element exists.
   *
   * @param path the search path for querying within this model's contents
   */
  public elementAt(path: Path): HistoricalElement<any>;

  /**
   * Given an array of search path elements, returns a read-only representation of the element at
   * that path at the current played-to version, or null if no such element exists.
   *
   * @param elements an array of search path elements (which in totality are a [[Path]])
   */
  public elementAt(...elements: PathElement[]): HistoricalElement<any>;
  public elementAt(...path: any[]): HistoricalElement<any> {
    return this._wrapperFactory.wrap(this._model.valueAt(...path));
  }

  /**
   * Enables "playing" the current model to the given version number. This is an
   * asynchronous call because it may take some time to traverse over potentially
   * thousands of versions of this model.
   *
   * The returned promise resolves when the playback process is complete.
   * At this point calling `version`, `time`, `root` and `elementAt` will return the
   * data / metadata of this model at the desired version.
   *
   * @param version the version of the model at which point in time you're interested
   */
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

    const request: IConvergenceMessage = {
      historicalOperationsRequest: {
        modelId: this._modelId,
        first: firstVersion,
        last: lastVersion
      }
    };

    const opRequest: OperationRequest = {
      forward,
      completed: false,
      operations: null
    };

    this._opRequests.push(opRequest);

    return this._connection.request(request).then((response: IConvergenceMessage) => {
      const {historicalOperationsResponse} = response;
      opRequest.completed = true;
      opRequest.operations = getOrDefaultArray(historicalOperationsResponse.operations).map(
        op => toModelOperation(op, this._identityCache));

      this._checkAndProcess();

      return;
    });
  }

  /**
   * "Plays" the current version of this model forward by the given number of versions.
   *
   * @param delta the number of versions to move forward
   *
   * @returns A Promise, which on resolve indicates that the playforward has completed.
   */
  public forward(delta: number = 1): Promise<void> {
    if (delta < 1) {
      throw new Error("delta must be > 0");
    } else if (this._targetVersion + delta > this._maxVersion) {
      throw new Error(`Cannot move forward by ${delta}, because that would exceed the model's maxVersion.`);
    }

    const desiredVersion: number = this._targetVersion + delta;
    return this.playTo(desiredVersion);

  }

  /**
   * "Plays" the current version of this model backward by the given number of versions.
   *
   * @param delta the number of versions to move backward
   *
   * @returns A Promise, which on resolve indicates that the playback has completed.
   */
  public backward(delta: number = 1): Promise<void> {
    if (delta < 1) {
      throw new Error("delta must be > 0");
    } else if (this._targetVersion - delta < 0) {
      throw new Error(`Cannot move backawrd by ${delta}, because that would move beyond version 0.`);
    }

    const desiredVersion: number = this._targetVersion - delta;
    return this.playTo(desiredVersion);
  }

  /**
   * @internal
   */
  private _checkAndProcess(): void {
    if (this._opRequests.length === 0) {
      throw new Error("There are no operation requests to process");
    }

    while (this._opRequests.length > 0 && this._opRequests[0].completed) {
      this._playOperations(this._opRequests[0].operations, this._opRequests[0].forward);
      this._opRequests.shift();
    }
  }

  /**
   * @internal
   */
  private _playOperations(operations: ModelOperation[], forward: boolean): void {
    // Going backwards
    if (!forward) {
      operations.reverse().forEach((op: ModelOperation) => {
        if (op.operation.type === OperationType.COMPOUND) {
          const compoundOp: AppliedCompoundOperation = op.operation as AppliedCompoundOperation;
          compoundOp.ops.reverse().forEach((discreteOp: AppliedDiscreteOperation) => {
            this._playDiscreteOp(op, discreteOp, true);
          });
        } else {
          this._playDiscreteOp(op, op.operation as AppliedDiscreteOperation, true);
        }
      });
    } else {
      // Going forwards
      operations.forEach((op: ModelOperation) => {
        if (op.operation.type === OperationType.COMPOUND) {
          const compoundOp: AppliedCompoundOperation = op.operation as AppliedCompoundOperation;
          compoundOp.ops.forEach((discreteOp: AppliedDiscreteOperation) => {
            this._playDiscreteOp(op, discreteOp, false);
          });
        } else {
          this._playDiscreteOp(op, op.operation as AppliedDiscreteOperation, false);
        }
      });
    }
  }

  /**
   * @internal
   */
  private _playDiscreteOp(op: ModelOperation, discreteOp: AppliedDiscreteOperation, inverse: boolean): void {
    if (!discreteOp.noOp) {
      const dOp: AppliedDiscreteOperation = inverse ?
        discreteOp.inverse() as AppliedDiscreteOperation :
        discreteOp;
      this._model.handleModelOperationEvent(
        new ModelOperationEvent(op.sessionId, op.user, op.version, op.timestamp, dOp));
    }

    // tslint:disable-next-line
    if (inverse) {
      this._version = op.version - 1;
    } else {
      this._version = op.version;
    }

    // fixme this is wrong.  Might be the op before.
    this._currentTime = new Date(op.timestamp);
  }
}
