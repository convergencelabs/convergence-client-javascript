import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {Path} from "../Path";
import {ModelReference} from "../reference/ModelReference";
import {HistoricalValue} from "./HistoricalValue";
import {HistoricalArray} from "./HistoricalArray";
import {HistoricalBoolean} from "./HistoricalBoolean";
import {HistoricalNumber} from "./HistoricalNumber";
import {HistoricalObject} from "./HistoricalObject";
import {HistoricalString} from "./HistoricalString";
export interface RemoteReferenceCreatedEvent extends ConvergenceEvent {
  reference: ModelReference<any>;
}
export interface ConvergenceModelValueEvent extends ConvergenceEvent {
  src: HistoricalValue<any>;
}
export declare class ValueDetachedEvent implements ConvergenceEvent {
  src: HistoricalValue<any>;
  name: string;

  constructor(src: HistoricalValue<any>);
}
export interface ValueChangedEvent extends ConvergenceModelValueEvent {
  sessionId: string;
  username: string;
}
export declare class ModelChangedEvent implements ConvergenceModelValueEvent {
  src: HistoricalValue<any>;
  relativePath: Path;
  childEvent: ValueChangedEvent;
  sessionId: string;
  username: string;
  name: string;
}
export declare class ArrayInsertEvent implements ValueChangedEvent {
  src: HistoricalArray;
  index: number;
  value: HistoricalValue<any>;
  sessionId: string;
  username: string;
  name: string;
}
export declare class ArrayRemoveEvent implements ValueChangedEvent {
  src: HistoricalArray;
  index: number;
  sessionId: string;
  username: string;
  name: string;
}
export declare class ArraySetEvent implements ValueChangedEvent {
  src: HistoricalArray;
  index: number;
  value: any;
  sessionId: string;
  username: string;
  name: string;
}
export declare class ArrayReorderEvent implements ValueChangedEvent {
  src: HistoricalArray;
  fromIndex: number;
  toIndex: number;
  sessionId: string;
  username: string;
  name: string;
}
export declare class ArraySetValueEvent implements ValueChangedEvent {
  src: HistoricalArray;
  value: Array<any>;
  sessionId: string;
  username: string;
  name: string;
}
export declare class BooleanSetValueEvent implements ValueChangedEvent {
  src: HistoricalBoolean;
  value: boolean;
  sessionId: string;
  username: string;
  name: string;
}
export declare class NumberSetValueEvent implements ValueChangedEvent {
  src: HistoricalNumber;
  value: number;
  sessionId: string;
  username: string;
  name: string;
}
export declare class NumberAddEvent implements ValueChangedEvent {
  src: HistoricalNumber;
  value: number;
  sessionId: string;
  username: string;
  name: string;
}
export declare class ObjectSetEvent implements ValueChangedEvent {
  src: HistoricalObject;
  key: string;
  value: HistoricalValue<any>;
  sessionId: string;
  username: string;
  name: string;
}
export declare class ObjectRemoveEvent implements ValueChangedEvent {
  src: HistoricalObject;
  key: string;
  sessionId: string;
  username: string;
  name: string;
}
export declare class ObjectSetValueEvent implements ValueChangedEvent {
  src: HistoricalObject;
  value: Map<string, any>;
  sessionId: string;
  username: string;
  name: string;

  constructor(src: HistoricalObject, value: Map<string, any>, sessionId: string, username: string);
}
export declare class NodeSetValueEvent implements ValueChangedEvent {
  src: HistoricalObject;
  sessionId: string;
  username: string;
  name: string;
}
export declare class StringInsertEvent implements ValueChangedEvent {
  src: HistoricalString;
  index: number;
  value: string;
  sessionId: string;
  username: string;
  name: string;
}
export declare class StringRemoveEvent implements ValueChangedEvent {
  src: HistoricalString;
  index: number;
  value: string;
  sessionId: string;
  username: string;
  name: string;
}
export declare class StringSetValueEvent implements ValueChangedEvent {
  src: HistoricalString;
  value: string;
  sessionId: string;
  username: string;
  name: string;
}
