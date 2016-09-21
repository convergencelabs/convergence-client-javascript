import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {Path} from "../Path";
import {RealTimeValue} from "./RealTimeValue";
import {RealTimeArray} from "./RealTimeArray";
import {RealTimeBoolean} from "./RealTimeBoolean";
import {RealTimeNumber} from "./RealTimeNumber";
import {RealTimeObject} from "./RealTimeObject";
import {RealTimeString} from "./RealTimeString";
import {ModelReference} from "../reference/ModelReference";
import {RealTimeModel} from "./RealTimeModel";
export interface ModelEvent extends ConvergenceEvent {
  src: RealTimeModel;
}
export interface ModelClosedEvent extends ModelEvent {
  local: boolean;
  reason?: string;
}
export interface VersionChangedEvent extends ModelEvent {
  version: number;
}
export interface RemoteReferenceCreatedEvent extends ConvergenceEvent {
  reference: ModelReference<any>;
}
export interface ConvergenceModelValueEvent extends ConvergenceEvent {
  src: RealTimeValue<any>;
}
export declare class ValueDetachedEvent implements ConvergenceEvent {
  src: RealTimeValue<any>;
  name: string;

  constructor(src: RealTimeValue<any>);
}
export interface ValueChangedEvent extends ConvergenceModelValueEvent {
  sessionId: string;
  username: string;
}
export declare class ModelChangedEvent implements ConvergenceModelValueEvent {
  src: RealTimeValue<any>;
  relativePath: Path;
  childEvent: ValueChangedEvent;
  sessionId: string;
  username: string;
  name: string;

  constructor(src: RealTimeValue<any>, relativePath: Path, childEvent: ValueChangedEvent, sessionId: string, username: string);
}
export declare class ArrayInsertEvent implements ValueChangedEvent {
  src: RealTimeArray;
  index: number;
  value: RealTimeValue<any>;
  sessionId: string;
  username: string;
  name: string;

  constructor(src: RealTimeArray, index: number, value: RealTimeValue<any>, sessionId: string, username: string);
}
export declare class ArrayRemoveEvent implements ValueChangedEvent {
  src: RealTimeArray;
  index: number;
  sessionId: string;
  username: string;
  name: string;

  constructor(src: RealTimeArray, index: number, sessionId: string, username: string);
}
export declare class ArraySetEvent implements ValueChangedEvent {
  src: RealTimeArray;
  index: number;
  value: any;
  sessionId: string;
  username: string;
  name: string;

  constructor(src: RealTimeArray, index: number, value: any, sessionId: string, username: string);
}
export declare class ArrayReorderEvent implements ValueChangedEvent {
  src: RealTimeArray;
  fromIndex: number;
  toIndex: number;
  sessionId: string;
  username: string;
  name: string;

  constructor(src: RealTimeArray, fromIndex: number, toIndex: number, sessionId: string, username: string);
}
export declare class ArraySetValueEvent implements ValueChangedEvent {
  src: RealTimeArray;
  value: Array<any>;
  sessionId: string;
  username: string;
  name: string;

  constructor(src: RealTimeArray, value: Array<any>, sessionId: string, username: string);
}
export declare class BooleanSetValueEvent implements ValueChangedEvent {
  src: RealTimeBoolean;
  value: boolean;
  sessionId: string;
  username: string;
  name: string;

  constructor(src: RealTimeBoolean, value: boolean, sessionId: string, username: string);
}
export declare class NumberSetValueEvent implements ValueChangedEvent {
  src: RealTimeNumber;
  value: number;
  sessionId: string;
  username: string;
  name: string;

  constructor(src: RealTimeNumber, value: number, sessionId: string, username: string);
}
export declare class NumberAddEvent implements ValueChangedEvent {
  src: RealTimeNumber;
  value: number;
  sessionId: string;
  username: string;
  name: string;

  constructor(src: RealTimeNumber, value: number, sessionId: string, username: string);
}
export declare class ObjectSetEvent implements ValueChangedEvent {
  src: RealTimeObject;
  key: string;
  value: RealTimeValue<any>;
  sessionId: string;
  username: string;
  name: string;

  constructor(src: RealTimeObject, key: string, value: RealTimeValue<any>, sessionId: string, username: string);
}
export declare class ObjectRemoveEvent implements ValueChangedEvent {
  src: RealTimeObject;
  key: string;
  sessionId: string;
  username: string;
  name: string;

  constructor(src: RealTimeObject, key: string, sessionId: string, username: string);
}
export declare class ObjectSetValueEvent implements ValueChangedEvent {
  src: RealTimeObject;
  value: {
    [key: string]: any;
  };
  sessionId: string;
  username: string;
  name: string;

  constructor(src: RealTimeObject, value: {
    [key: string]: any;
  }, sessionId: string, username: string);
}
export declare class NodeSetValueEvent implements ValueChangedEvent {
  src: RealTimeObject;
  sessionId: string;
  username: string;
  name: string;

  constructor(src: RealTimeObject, sessionId: string, username: string);
}
export declare class StringInsertEvent implements ValueChangedEvent {
  src: RealTimeString;
  index: number;
  value: string;
  sessionId: string;
  username: string;
  name: string;

  constructor(src: RealTimeString, index: number, value: string, sessionId: string, username: string);
}
export declare class StringRemoveEvent implements ValueChangedEvent {
  src: RealTimeString;
  index: number;
  value: string;
  sessionId: string;
  username: string;
  name: string;

  constructor(src: RealTimeString, index: number, value: string, sessionId: string, username: string);
}
export declare class StringSetValueEvent implements ValueChangedEvent {
  src: RealTimeString;
  value: string;
  sessionId: string;
  username: string;
  name: string;

  constructor(src: RealTimeString, value: string, sessionId: string, username: string);
}
