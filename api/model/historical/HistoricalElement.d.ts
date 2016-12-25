import {Path} from "../Path";
import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";


export declare abstract class HistoricalElement<T> extends ConvergenceEventEmitter {

  public id(): string;

  public type(): String;

  public path(): Path;

  public isDetached(): boolean;

  public data(): T;
}
