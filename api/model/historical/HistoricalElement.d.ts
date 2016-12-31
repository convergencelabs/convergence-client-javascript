import {Path} from "../Path";
import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";
import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {ObservableElement} from "../observable/ObservableElement";

export declare abstract class HistoricalElement<T> extends ConvergenceEventEmitter<ConvergenceEvent>
  implements ObservableElement<T> {

  public id(): string;

  public type(): string;

  public path(): Path;

  public isDetached(): boolean;

  public value(): T;
}
