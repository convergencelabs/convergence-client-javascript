import {Path} from "../Path";
import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";
import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {ObservableElement, ObservableElementEvents} from "../observable/ObservableElement";
import {HistoricalModel} from "./HistoricalModel";
import {HistoricalContainerElement} from "./HistoricalContainerElement";

export interface HistoricalElementEvents extends ObservableElementEvents {
}

export declare abstract class HistoricalElement<T> extends ConvergenceEventEmitter<ConvergenceEvent>
  implements ObservableElement<T> {

  public static readonly Events: HistoricalElementEvents;

  public id(): string;

  public type(): string;

  public path(): Path;

  public parent(): HistoricalContainerElement<any>

  public isDetached(): boolean;

  public value(): T;

  public model(): HistoricalModel;

  public toJSON(): any;
}
