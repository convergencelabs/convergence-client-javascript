import {ConvergenceEvent} from "../util/ConvergenceEvent";
import {Path} from "./Path";
import {ModelReference} from "./reference/ModelReference";
import {ObservableModel} from "./observable/ObservableModel";
import {ObservableElement} from "./observable/ObservableElement";
import {ObservableArray} from "./observable/ObservableArray";
import {ObservableBoolean} from "./observable/ObservableBoolean";
import {ObservableDate} from "./observable/ObservableDate";
import {ObservableNumber} from "./observable/ObservableNumber";
import {ObservableObject} from "./observable/ObservableObject";
import {ObservableString} from "./observable/ObservableString";
import {ModelPermissions} from "./ModelPermissions";
import {RealTimeModel} from "./rt/RealTimeModel";

export interface ModelEvent extends ConvergenceEvent {
  readonly src: ObservableModel;
}

export interface ModelClosedEvent extends ModelEvent {
  readonly local: boolean;
  readonly reason?: string;
}

export interface VersionChangedEvent extends ModelEvent {
  readonly version: number;
}

export declare class RemoteReferenceCreatedEvent implements ConvergenceEvent {
  public static readonly NAME: string;
  public readonly name: string;
  public readonly reference: ModelReference<any>;
  public readonly element?: ObservableElement<any>;
  public readonly model?: ObservableModel;
}

export declare class ModelPermissionsChangedEvent implements ConvergenceEvent {
  public static readonly NAME: string;
  public readonly name: string;
  public readonly model: RealTimeModel;
  public readonly permissions: ModelPermissions;
  public readonly changes: string[];
}

export interface ConvergenceModelValueEvent extends ConvergenceEvent {
  readonly element: ObservableElement<any>;
  readonly local: boolean;
}

export declare class ElementDetachedEvent implements ConvergenceEvent {
  public static readonly NAME: string;
  public readonly name: string;
  public readonly src: ObservableElement<any>;
}

export interface ValueChangedEvent extends ConvergenceModelValueEvent {
  readonly sessionId: string;
  readonly username: string;
  readonly local: boolean;
}

export declare class ModelChangedEvent implements ConvergenceModelValueEvent {
  public static readonly NAME: string;
  public readonly name: string;
  public readonly element: ObservableElement<any>;
  public readonly relativePath: Path;
  public readonly childEvent: ValueChangedEvent;
  public readonly sessionId: string;
  public readonly username: string;
  public readonly local: boolean;
}

export class ArrayInsertEvent implements ValueChangedEvent {
  public static readonly NAME: string;
  public readonly name: string;
  public readonly element: ObservableArray;
  public readonly index: number;
  public readonly value: ObservableElement<any>;
  public readonly sessionId: string;
  public readonly username: string;
  public readonly local: boolean;

}

export class ArrayRemoveEvent implements ValueChangedEvent {
  public static readonly NAME: string;
  public readonly name: string;
  public readonly element: ObservableArray;
  public readonly index: number;
  public readonly sessionId: string;
  public readonly username: string;
  public readonly local: boolean;
}

export class ArraySetEvent implements ValueChangedEvent {
  public static readonly NAME: string;
  public readonly name: string;
  public readonly element: ObservableArray;
  public readonly index: number;
  public readonly value: ObservableElement<any>;
  public readonly sessionId: string;
  public readonly username: string;
  public readonly local: boolean;
}

export class ArrayReorderEvent implements ValueChangedEvent {
  public static readonly NAME: string;
  public readonly name: string;
  public readonly element: ObservableArray;
  public readonly fromIndex: number;
  public readonly toIndex: number;
  public readonly sessionId: string;
  public readonly username: string;
  public readonly local: boolean;
}

export class ArraySetValueEvent implements ValueChangedEvent {
  public static readonly NAME: string;
  public readonly name: string;
  public readonly element: ObservableArray;
  public readonly sessionId: string;
  public readonly username: string;
  public readonly local: boolean;
}

export class BooleanSetValueEvent implements ValueChangedEvent {
  public static readonly NAME: string;
  public readonly name: string;
  public readonly element: ObservableBoolean;
  public readonly sessionId: string;
  public readonly username: string;
  public readonly local: boolean;
}

export class DateSetValueEvent implements ValueChangedEvent {
  public static readonly NAME: string;
  public readonly name: string;
  public readonly element: ObservableDate;
  public readonly sessionId: string;
  public readonly username: string;
  public readonly local: boolean;
}

export class NumberSetValueEvent implements ValueChangedEvent {
  public static readonly NAME: string;
  public readonly name: string;
  public readonly element: ObservableNumber;
  public readonly sessionId: string;
  public readonly username: string;
  public readonly local: boolean;
}

export class NumberDeltaEvent implements ValueChangedEvent {
  public static readonly NAME: string;
  public readonly name: string;
  public readonly element: ObservableNumber;
  public readonly value: number;
  public readonly sessionId: string;
  public readonly username: string;
  public readonly local: boolean;
}

export class ObjectSetEvent implements ValueChangedEvent {
  public static readonly NAME: string;
  public readonly name: string;
  public readonly element: ObservableObject;
  public readonly key: string;
  public readonly value: ObservableElement<any>;
  public readonly sessionId: string;
  public readonly username: string;
  public readonly local: boolean;
}

export class ObjectRemoveEvent implements ValueChangedEvent {
  public static readonly NAME: string;
  public readonly name: string;
  public readonly element: ObservableObject;
  public readonly key: string;
  public readonly sessionId: string;
  public readonly username: string;
  public readonly local: boolean;
}

export class ObjectSetValueEvent implements ValueChangedEvent {
  public static readonly NAME: string;
  public readonly name: string;
  public readonly element: ObservableObject;
  public readonly sessionId: string;
  public readonly username: string;
  public readonly local: boolean;
}

export class StringInsertEvent implements ValueChangedEvent {
  public static readonly NAME: string;
  public readonly name: string;
  public readonly element: ObservableString;
  public readonly index: number;
  public readonly value: string;
  public readonly sessionId: string;
  public readonly username: string;
  public readonly local: boolean;
}

export class StringRemoveEvent implements ValueChangedEvent {
  public static readonly NAME: string;
  public readonly name: string;
  public readonly element: ObservableString;
  public readonly index: number;
  public readonly value: string;
  public readonly sessionId: string;
  public readonly username: string;
  public readonly local: boolean;
}

export class StringSetValueEvent implements ValueChangedEvent {
  public static readonly NAME: string;
  public readonly name: string;
  public readonly element: ObservableString;
  public readonly sessionId: string;
  public readonly username: string;
  public readonly local: boolean;
}
