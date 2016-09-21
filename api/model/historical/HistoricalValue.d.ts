import {ModelValueType} from "../ModelValueType";
import {Path} from "../Path";
import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";

export declare abstract class HistoricalValue<T> extends ConvergenceEventEmitter {

  id(): string;

  type(): ModelValueType;

  path(): Path;

  isDetached(): boolean;

  data(): T;
}
