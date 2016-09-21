import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";
import {ModelValueType} from "../ModelValueType";
import {Path} from "../Path";
import {ModelReference} from "../reference/ModelReference";
import {ReferenceFilter} from "../reference/ReferenceFilter";

export declare abstract class RealTimeValue<T> extends ConvergenceEventEmitter {

  static Events: any;

  id(): string;

  type(): ModelValueType;

  path(): Path;

  isDetached(): boolean;

  data(): T;
  data(value: T): void;

  reference(sessionId: string, key: string): ModelReference<any>;

  references(filter?: ReferenceFilter): ModelReference<any>[];
}
