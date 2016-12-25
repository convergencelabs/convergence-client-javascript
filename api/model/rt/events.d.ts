import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {Path} from "../Path";
import {RealTimeElement} from "./RealTimeElement";
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
  src: RealTimeElement<any>;
}

export declare class ValueDetachedEvent implements ConvergenceEvent {
  public src: RealTimeElement<any>;
  public name: string;
}

export interface ValueChangedEvent extends ConvergenceModelValueEvent {
   sessionId: string;
   username: string;
}

export declare class ModelChangedEvent implements ConvergenceModelValueEvent {
  public src: RealTimeElement<any>;
  public relativePath: Path;
  public childEvent: ValueChangedEvent;
  public sessionId: string;
  public username: string;
  public name: string;
}

export declare class ArrayInsertEvent implements ValueChangedEvent {
  public src: RealTimeArray;
  public index: number;
  public value: RealTimeElement<any>;
  public sessionId: string;
  public username: string;
  public name: string;
}

export declare class ArrayRemoveEvent implements ValueChangedEvent {
  public src: RealTimeArray;
  public index: number;
  public sessionId: string;
  public username: string;
  public name: string;
}
export declare class ArraySetEvent implements ValueChangedEvent {
  public src: RealTimeArray;
  public index: number;
  public value: RealTimeElement<any>;
  public sessionId: string;
  public username: string;
  public name: string;
}

export declare class ArrayReorderEvent implements ValueChangedEvent {
  public src: RealTimeArray;
  public fromIndex: number;
  public toIndex: number;
  public sessionId: string;
  public username: string;
  public name: string;
}

export declare class ArraySetValueEvent implements ValueChangedEvent {
  public src: RealTimeArray;
  public value: Array<any>;
  public sessionId: string;
  public username: string;
  public name: string;
}

export declare class BooleanSetValueEvent implements ValueChangedEvent {
  public src: RealTimeBoolean;
  public value: boolean;
  public sessionId: string;
  public username: string;
  public name: string;
}

export declare class NumberSetValueEvent implements ValueChangedEvent {
  public src: RealTimeNumber;
  public value: number;
  public sessionId: string;
  public username: string;
  public name: string;
}

export declare class NumberAddEvent implements ValueChangedEvent {
  public src: RealTimeNumber;
  public value: number;
  public sessionId: string;
  public username: string;
  public name: string;
}

export declare class ObjectSetEvent implements ValueChangedEvent {
  public src: RealTimeObject;
  public key: string;
  public value: RealTimeElement<any>;
  public sessionId: string;
  public username: string;
  public name: string;
}

export declare class ObjectRemoveEvent implements ValueChangedEvent {
  public src: RealTimeObject;
  public key: string;
  public sessionId: string;
  public username: string;
  public name: string;
}

export declare class ObjectSetValueEvent implements ValueChangedEvent {
  public src: RealTimeObject;
  public sessionId: string;
  public username: string;
  public name: string;
}

export declare class NodeSetValueEvent implements ValueChangedEvent {
  public src: RealTimeObject;
  public sessionId: string;
  public username: string;
  public name: string;
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
