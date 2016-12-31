import {ConvergenceEvent} from "../util/ConvergenceEvent";
import {Path} from "./Path";
import {ModelReference} from "./reference/ModelReference";
import {ObservableModel} from "./observable/ObservableModel";
import {ObservableElement} from "./observable/ObservableElement";
import {ObservableArray} from "./observable/ObservableArray";
import {ObservableBoolean} from "./observable/ObservableBoolean";
import {ObservableNumber} from "./observable/ObservableNumber";
import {ObservableObject} from "./observable/ObservableObject";
import {ObservableString} from "./observable/ObservableString";

export interface ModelEvent extends ConvergenceEvent {
  src: ObservableModel;
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
  src: ObservableElement<any>;
  local: boolean;
}

export declare class ElementDetachedEvent implements ConvergenceEvent {
  public name: string;
  public src: ObservableElement<any>;
}

export interface ValueChangedEvent extends ConvergenceModelValueEvent {
  sessionId: string;
  username: string;
}

export declare class ModelChangedEvent implements ConvergenceModelValueEvent {
  public name: string;
  public src: ObservableElement<any>;
  public relativePath: Path;
  public childEvent: ValueChangedEvent;
  public sessionId: string;
  public username: string;
  public local: boolean;
}

export class ArrayInsertEvent implements ValueChangedEvent {
  public name: string;
  public src: ObservableArray;
  public index: number;
  public value: ObservableElement<any>;
  public sessionId: string;
  public username: string;
  public local: boolean;

}

export class ArrayRemoveEvent implements ValueChangedEvent {
  public name: string;
  public src: ObservableArray;
  public index: number;
  public sessionId: string;
  public username: string;
  public local: boolean;
}

export class ArraySetEvent implements ValueChangedEvent {
  public name: string;
  public src: ObservableArray;
  public index: number;
  public value: ObservableElement<any>;
  public sessionId: string;
  public username: string;
  public local: boolean;
}

export class ArrayReorderEvent implements ValueChangedEvent {
  public name: string;
  public src: ObservableArray;
  public fromIndex: number;
  public toIndex: number;
  public sessionId: string;
  public username: string;
  public local: boolean;
}

export class ArraySetValueEvent implements ValueChangedEvent {
  public name: string;
  public src: ObservableArray;
  public sessionId: string;
  public username: string;
  public local: boolean;
}

export class BooleanSetValueEvent implements ValueChangedEvent {
  public name: string;
  public src: ObservableBoolean;
  public sessionId: string;
  public username: string;
  public local: boolean;
}

export class NumberSetValueEvent implements ValueChangedEvent {
  public name: string;
  public src: ObservableNumber;
  public sessionId: string;
  public username: string;
  public local: boolean;
}

export class NumberDeltaEvent implements ValueChangedEvent {
  public name: string;
  public src: ObservableNumber;
  public value: number;
  public sessionId: string;
  public username: string;
  public local: boolean;
}

export class ObjectSetEvent implements ValueChangedEvent {
  public name: string;
  public src: ObservableObject;
  public key: string;
  public value: ObservableElement<any>;
  public sessionId: string;
  public username: string;
  public local: boolean;
}

export class ObjectRemoveEvent implements ValueChangedEvent {
  public name: string;
  public src: ObservableObject;
  public key: string;
  public sessionId: string;
  public username: string;
  public local: boolean;
}

export class ObjectSetValueEvent implements ValueChangedEvent {
  public name: string;
  public src: ObservableObject;
  public sessionId: string;
  public username: string;
  public local: boolean;
}

export class StringInsertEvent implements ValueChangedEvent {
  public name: string;
  public src: ObservableString;
  public index: number;
  public value: string;
  public sessionId: string;
  public username: string;
  public local: boolean;
}

export class StringRemoveEvent implements ValueChangedEvent {
  public name: string;
  public src: ObservableString;
  public index: number;
  public value: string;
  public sessionId: string;
  public username: string;
  public local: boolean;
}

export class StringSetValueEvent implements ValueChangedEvent {
  public name: string;
  public src: ObservableString;
  public sessionId: string;
  public username: string;
  public local: boolean;
}
