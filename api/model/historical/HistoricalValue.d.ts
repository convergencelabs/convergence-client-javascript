import {ModelElementType} from "../ModelElementType";
import {Path} from "../Path";
import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";

export declare abstract class HistoricalValue<T> extends ConvergenceEventEmitter {

  id(): string;

  type(): ModelElementType;

  path(): Path;

  isDetached(): boolean;

  data(): T;
}
