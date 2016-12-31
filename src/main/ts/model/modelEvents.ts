import {ConvergenceEvent} from "../util/ConvergenceEvent";
import {Path} from "./ot/Path";
import {ModelReference} from "./reference/ModelReference";
import {ObservableModel} from "./element/ObservableModel";
import {ObservableElement} from "./element/ObservableElement";
import {ObservableArray} from "./element/ObservableArray";
import {ObservableBoolean} from "./element/ObservableBoolean";
import {ObservableNumber} from "./element/ObservableNumber";
import {ObservableObject} from "./element/ObservableObject";
import {ObservableString} from "./element/ObservableString";

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

export class ElementDetachedEvent implements ConvergenceEvent {
  public name: string = "detached";
  constructor(public src: ObservableElement<any>) {}
}

export interface ValueChangedEvent extends ConvergenceModelValueEvent {
  sessionId: string;
  username: string;
}

export class ModelChangedEvent implements ConvergenceModelValueEvent {

  public name: string = "model_changed";
  constructor(public src: ObservableElement<any>,
              public relativePath: Path,
              public childEvent: ValueChangedEvent,
              public sessionId: string,
              public username: string,
              public local: boolean) {}
}

export class ArrayInsertEvent implements ValueChangedEvent {
  public name: string = "insert";
  constructor(public src: ObservableArray,
              public index: number,
              public value: ObservableElement<any>,
              public sessionId: string,
              public username: string,
              public local: boolean) {}
}

export class ArrayRemoveEvent implements ValueChangedEvent {
  public name: string = "remove";
  constructor(public src: ObservableArray,
              public index: number,
              public sessionId: string,
              public username: string,
              public local: boolean) {}
}

export class ArraySetEvent implements ValueChangedEvent {
  public name: string = "set";
  constructor(public src: ObservableArray,
              public index: number,
              public value: ObservableElement<any>,
              public sessionId: string,
              public username: string,
              public local: boolean) {}
}

export class ArrayReorderEvent implements ValueChangedEvent {
  public name: string = "reorder";
  constructor(public src: ObservableArray,
              public fromIndex: number,
              public toIndex: number,
              public sessionId: string,
              public username: string,
              public local: boolean) {}
}

export class ArraySetValueEvent implements ValueChangedEvent {
  public name: string = "value";
  constructor(public src: ObservableArray,
              public sessionId: string,
              public username: string,
              public local: boolean) {}
}

export class BooleanSetValueEvent implements ValueChangedEvent {
  public name: string = "value";
  constructor(public src: ObservableBoolean,
              public sessionId: string,
              public username: string,
              public local: boolean) {}
}

export class NumberSetValueEvent implements ValueChangedEvent {
  public name: string = "value";
  constructor(public src: ObservableNumber,
              public sessionId: string,
              public username: string,
              public local: boolean) {}
}

export class NumberDeltaEvent implements ValueChangedEvent {
  public name: string = "delta";
  constructor(public src: ObservableNumber,
              public value: number,
              public sessionId: string,
              public username: string,
              public local: boolean) {}
}

export class ObjectSetEvent implements ValueChangedEvent {
  public name: string = "set";
  constructor(public src: ObservableObject,
              public key: string,
              public value: ObservableElement<any>,
              public sessionId: string,
              public username: string,
              public local: boolean) {}
}

export class ObjectRemoveEvent implements ValueChangedEvent {
  public name: string = "remove";
  constructor(public src: ObservableObject,
              public key: string,
              public sessionId: string,
              public username: string,
              public local: boolean) {}
}

export class ObjectSetValueEvent implements ValueChangedEvent {
  public name: string = "value";
  constructor(public src: ObservableObject,
              public sessionId: string,
              public username: string,
              public local: boolean) {}
}

export class NodeSetValueEvent implements ValueChangedEvent {
  public name: string = "value";
  constructor(public src: ObservableObject,
              public sessionId: string,
              public username: string,
              public local: boolean) {}
}

export class StringInsertEvent implements ValueChangedEvent {
  public name: string = "insert";
  constructor(public src: ObservableString,
              public index: number,
              public value: string,
              public sessionId: string,
              public username: string,
              public local: boolean) {}
}

export class StringRemoveEvent implements ValueChangedEvent {
  public name: string = "remove";
  constructor(public src: ObservableString,
              public index: number,
              public value: string,
              public sessionId: string,
              public username: string,
              public local: boolean) {}
}

export class StringSetValueEvent implements ValueChangedEvent {
  public name: string = "value";
  constructor(public src: ObservableString,
              public sessionId: string,
              public username: string,
              public local: boolean) {}
}
