import {Session} from "../../Session";
import {HistoricalObject} from "./HistoricalObject";
import {HistoricalValue} from "./HistoricalValue";
import {ModelService} from "../ModelService";
import {ModelFqn} from "../ModelFqn";
import {Model} from "../internal/Model";
import {ObjectValue} from "../dataValue";
import {HistoricalWrapperFactory} from "./HistoricalWrapperFactory";

export class HistoricalModel {

  private _version: number;
  private _modifiedTime: Date;
  private _model: Model;
  private _wrapperFactory: HistoricalWrapperFactory;

  constructor(data: ObjectValue,
              version: number,
              modifiedTime: Date,
              private _createdTime: Date,
              private _modelFqn: ModelFqn,
              private _modelService: ModelService,
              private _session: Session) {

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
    // FIXME
    return;
  }

  root(): HistoricalObject {
    return <HistoricalObject> this._wrapperFactory.wrap(this._model.root());
  }

  goto(version: number): void {

  }

  skipForward(delta: number): void {

  }

  skipBackward(delta: number): void {

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
