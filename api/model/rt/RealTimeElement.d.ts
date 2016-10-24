import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";
import {ModelValueType} from "../ModelValueType";
import {Path} from "../Path";
import {ModelReference} from "../reference/ModelReference";
import {ReferenceFilter} from "../reference/ReferenceFilter";
import {RealTimeContainerElement} from "./RealTimeContainerElement";

export declare abstract class RealTimeElement<T> extends ConvergenceEventEmitter {

  static Events: any;

  id(): string;

  type(): ModelValueType;

  path(): Path;

  isAttached(): boolean;

  isDetached(): boolean;

  parent(): RealTimeContainerElement<any>

  value(): T;
  value(value: T): void;

  reference(sessionId: string, key: string): ModelReference<any>;

  references(filter?: ReferenceFilter): ModelReference<any>[];
}
