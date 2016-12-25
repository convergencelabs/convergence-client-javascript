import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {Path} from "../Path";
import {HistoricalElement} from "./HistoricalElement";
import {HistoricalArray} from "./HistoricalArray";
import {HistoricalBoolean} from "./HistoricalBoolean";
import {HistoricalNumber} from "./HistoricalNumber";
import {HistoricalObject} from "./HistoricalObject";
import {HistoricalString} from "./HistoricalString";

export interface ConvergenceModelValueEvent extends ConvergenceEvent {
  src: HistoricalElement<any>;
}

export declare class ValueDetachedEvent implements ConvergenceEvent {
  public src: HistoricalElement<any>;
  public name: string;
}

export interface ValueChangedEvent extends ConvergenceModelValueEvent {
  sessionId: string;
  username: string;
}

export declare class ModelChangedEvent implements ConvergenceModelValueEvent {
  public src: HistoricalElement<any>;
  public relativePath: Path;
  public childEvent: ValueChangedEvent;
  public sessionId: string;
  public username: string;
  public name: string;
}

export declare class ArrayInsertEvent implements ValueChangedEvent {
  public src: HistoricalArray;
  public index: number;
  public value: HistoricalElement<any>;
  public sessionId: string;
  public username: string;
  public name: string;
}

export declare class ArrayRemoveEvent implements ValueChangedEvent {
  public src: HistoricalArray;
  public index: number;
  public sessionId: string;
  public username: string;
  public name: string;
}

export declare class ArraySetEvent implements ValueChangedEvent {
  public src: HistoricalArray;
  public index: number;
  public value: HistoricalElement<any>;
  public sessionId: string;
  public username: string;
  public name: string;
}

export declare class ArrayReorderEvent implements ValueChangedEvent {
  public src: HistoricalArray;
  public fromIndex: number;
  public toIndex: number;
  public sessionId: string;
  public username: string;
  public name: string;
}

export declare class ArraySetValueEvent implements ValueChangedEvent {
  public src: HistoricalArray;
  public sessionId: string;
  public username: string;
  public name: string;
}

export declare class BooleanSetValueEvent implements ValueChangedEvent {
  public src: HistoricalBoolean;
  public sessionId: string;
  public username: string;
  public name: string;
}
export declare class NumberSetValueEvent implements ValueChangedEvent {
  public src: HistoricalNumber;
  public sessionId: string;
  public username: string;
  public name: string;
}

export declare class NumberDeltaEvent implements ValueChangedEvent {
  public src: HistoricalNumber;
  public value: number;
  public sessionId: string;
  public username: string;
  public name: string;
}

export declare class ObjectSetEvent implements ValueChangedEvent {
  public src: HistoricalObject;
  public key: string;
  public value: HistoricalElement<any>;
  public sessionId: string;
  public username: string;
  public name: string;
}

export declare class ObjectRemoveEvent implements ValueChangedEvent {
  public src: HistoricalObject;
  public key: string;
  public sessionId: string;
  public username: string;
  public name: string;
}

export declare class ObjectSetValueEvent implements ValueChangedEvent {
  public src: HistoricalObject;
  public sessionId: string;
  public username: string;
  public name: string;
}

export declare class StringInsertEvent implements ValueChangedEvent {
  public src: HistoricalString;
  public index: number;
  public value: string;
  public sessionId: string;
  public username: string;
  public name: string;
}

export declare class StringRemoveEvent implements ValueChangedEvent {
  public src: HistoricalString;
  public index: number;
  public value: string;
  public sessionId: string;
  public username: string;
  public name: string;
}

export declare class StringSetValueEvent implements ValueChangedEvent {
  public src: HistoricalString;
  public sessionId: string;
  public username: string;
  public name: string;
}
