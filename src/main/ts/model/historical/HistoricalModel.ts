import {ObservableModel} from "../observable/ObservableModel";
import {RealTimeModel} from "../rt/RealTimeModel";
import {Session} from "../../Session";
import {HistoricalObject} from "./HistoricalObject";
import {HistoricalValue} from "./HistoricalValue";
import {HistoricalValueConverter} from "./HistoricalValueConverter";
import {ModelService} from "../ModelService";

export class HistoricalModel implements ObservableModel {

  private _model: RealTimeModel;
  private _modelService: ModelService;

  constructor(model: RealTimeModel, modelService: ModelService) {
    this._model = model;
    this._modelService = modelService;
  }

  collectionId(): string {
    return this._model.collectionId();
  }

  modelId(): string {
    return this._model.modelId();
  }

  version(): number {
    return this._model.version();
  }

  createdTime(): Date {
    return this._model.createdTime();
  }

  modifiedTime(): Date {
    return this._model.modifiedTime();
  }

  value(): HistoricalObject {
    return <HistoricalObject>HistoricalValueConverter.wrapValue(this._model.value());
  }

  valueAt(path: any): HistoricalValue<any> {
    return HistoricalValueConverter.wrapValue(this._model.valueAt(path));
  }

  session(): Session {
    return this._model.session();
  }

  close(): Promise<void> {
    return;
  }

  isOpen(): boolean {
    return this._model.isOpen();
  }

  _handleMessage(messageEvent: MessageEvent): void {

  }
}
