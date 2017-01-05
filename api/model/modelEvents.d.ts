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
  public readonly name: string;
  public readonly src: ObservableElement<any>;
}

export interface ValueChangedEvent extends ConvergenceModelValueEvent {
  sessionId: string;
  username: string;
}

export declare class ModelChangedEvent implements ConvergenceModelValueEvent {
  public readonly name: string;
  public readonly src: ObservableElement<any>;
  public readonly relativePath: Path;
  public readonly childEvent: ValueChangedEvent;
  public readonly sessionId: string;
  public readonly username: string;
  public readonly local: boolean;
}

export class ArrayInsertEvent implements ValueChangedEvent {
  public readonly name: string;
  public readonly src: ObservableArray;
  public readonly index: number;
  public readonly value: ObservableElement<any>;
  public readonly sessionId: string;
  public readonly username: string;
  public readonly local: boolean;

}

export class ArrayRemoveEvent implements ValueChangedEvent {
  public readonly name: string;
  public readonly src: ObservableArray;
  public readonly index: number;
  public readonly sessionId: string;
  public readonly username: string;
  public readonly local: boolean;
}

export class ArraySetEvent implements ValueChangedEvent {
  public readonly name: string;
  public readonly src: ObservableArray;
  public readonly index: number;
  public readonly value: ObservableElement<any>;
  public readonly sessionId: string;
  public readonly username: string;
  public readonly local: boolean;
}

export class ArrayReorderEvent implements ValueChangedEvent {
  public readonly name: string;
  public readonly src: ObservableArray;
  public readonly fromIndex: number;
  public readonly toIndex: number;
  public readonly sessionId: string;
  public readonly username: string;
  public readonly local: boolean;
}

export class ArraySetValueEvent implements ValueChangedEvent {
  public readonly name: string;
  public readonly src: ObservableArray;
  public readonly sessionId: string;
  public readonly username: string;
  public readonly local: boolean;
}

export class BooleanSetValueEvent implements ValueChangedEvent {
  public readonly name: string;
  public readonly src: ObservableBoolean;
  public readonly sessionId: string;
  public readonly username: string;
  public readonly local: boolean;
}

export class NumberSetValueEvent implements ValueChangedEvent {
  public readonly name: string;
  public readonly src: ObservableNumber;
  public readonly sessionId: string;
  public readonly username: string;
  public readonly local: boolean;
}

export class NumberDeltaEvent implements ValueChangedEvent {
  public readonly name: string;
  public readonly src: ObservableNumber;
  public readonly value: number;
  public readonly sessionId: string;
  public readonly username: string;
  public readonly local: boolean;
}

export class ObjectSetEvent implements ValueChangedEvent {
  public readonly name: string;
  public readonly src: ObservableObject;
  public readonly key: string;
  public readonly value: ObservableElement<any>;
  public readonly sessionId: string;
  public readonly username: string;
  public readonly local: boolean;
}

export class ObjectRemoveEvent implements ValueChangedEvent {
  public readonly name: string;
  public readonly src: ObservableObject;
  public readonly key: string;
  public readonly sessionId: string;
  public readonly username: string;
  public readonly local: boolean;
}

export class ObjectSetValueEvent implements ValueChangedEvent {
  public readonly name: string;
  public readonly src: ObservableObject;
  public readonly sessionId: string;
  public readonly username: string;
  public readonly local: boolean;
}

export class StringInsertEvent implements ValueChangedEvent {
  public readonly name: string;
  public readonly src: ObservableString;
  public readonly index: number;
  public readonly value: string;
  public readonly sessionId: string;
  public readonly username: string;
  public readonly local: boolean;
}

export class StringRemoveEvent implements ValueChangedEvent {
  public readonly name: string;
  public readonly src: ObservableString;
  public readonly index: number;
  public readonly value: string;
  public readonly sessionId: string;
  public readonly username: string;
  public readonly local: boolean;
}

export class StringSetValueEvent implements ValueChangedEvent {
  public readonly name: string;
  public readonly src: ObservableString;
  public readonly sessionId: string;
  public readonly username: string;
  public readonly local: boolean;
}
