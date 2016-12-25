import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {Path} from "../ot/Path";
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
  local: boolean;
}

export class ElementDetachedEvent implements ConvergenceEvent {
  public name: string = "detached";
  constructor(public src: RealTimeElement<any>) {}
}

export interface ValueChangedEvent extends ConvergenceModelValueEvent {
  sessionId: string;
  username: string;
}

export class ModelChangedEvent implements ConvergenceModelValueEvent {

  public name: string = "model_changed";
  constructor(public src: RealTimeElement<any>,
              public relativePath: Path,
              public childEvent: ValueChangedEvent,
              public sessionId: string,
              public username: string,
              public local: boolean) {}
}

export class ArrayInsertEvent implements ValueChangedEvent {
  public name: string = "insert";
  constructor(public src: RealTimeArray,
              public index: number,
              public value: RealTimeElement<any>,
              public sessionId: string,
              public username: string,
              public local: boolean) {}
}

export class ArrayRemoveEvent implements ValueChangedEvent {
  public name: string = "remove";
  constructor(public src: RealTimeArray,
              public index: number,
              public sessionId: string,
              public username: string,
              public local: boolean) {}
}

export class ArraySetEvent implements ValueChangedEvent {
  public name: string = "set";
  constructor(public src: RealTimeArray,
              public index: number,
              public value: RealTimeElement<any>,
              public sessionId: string,
              public username: string,
              public local: boolean) {}
}

export class ArrayReorderEvent implements ValueChangedEvent {
  public name: string = "reorder";
  constructor(public src: RealTimeArray,
              public fromIndex: number,
              public toIndex: number,
              public sessionId: string,
              public username: string,
              public local: boolean) {}
}

export class ArraySetValueEvent implements ValueChangedEvent {
  public name: string = "value";
  constructor(public src: RealTimeArray,
              public sessionId: string,
              public username: string,
              public local: boolean) {}
}

export class BooleanSetValueEvent implements ValueChangedEvent {
  public name: string = "value";
  constructor(public src: RealTimeBoolean,
              public sessionId: string,
              public username: string,
              public local: boolean) {}
}

export class NumberSetValueEvent implements ValueChangedEvent {
  public name: string = "value";
  constructor(public src: RealTimeNumber,
              public sessionId: string,
              public username: string,
              public local: boolean) {}
}

export class NumberDeltaEvent implements ValueChangedEvent {
  public name: string = "delta";
  constructor(public src: RealTimeNumber,
              public value: number,
              public sessionId: string,
              public username: string,
              public local: boolean) {}
}

export class ObjectSetEvent implements ValueChangedEvent {
  public name: string = "set";
  constructor(public src: RealTimeObject,
              public key: string,
              public value: RealTimeElement<any>,
              public sessionId: string,
              public username: string,
              public local: boolean) {}
}

export class ObjectRemoveEvent implements ValueChangedEvent {
  public name: string = "remove";
  constructor(public src: RealTimeObject,
              public key: string,
              public sessionId: string,
              public username: string,
              public local: boolean) {}
}

export class ObjectSetValueEvent implements ValueChangedEvent {
  public name: string = "value";
  constructor(public src: RealTimeObject,
              public sessionId: string,
              public username: string,
              public local: boolean) {}
}

export class NodeSetValueEvent implements ValueChangedEvent {
  public name: string = "value";
  constructor(public src: RealTimeObject,
              public sessionId: string,
              public username: string,
              public local: boolean) {}
}

export class StringInsertEvent implements ValueChangedEvent {
  public name: string = "insert";
  constructor(public src: RealTimeString,
              public index: number,
              public value: string,
              public sessionId: string,
              public username: string,
              public local: boolean) {}
}

export class StringRemoveEvent implements ValueChangedEvent {
  public name: string = "remove";
  constructor(public src: RealTimeString,
              public index: number,
              public value: string,
              public sessionId: string,
              public username: string,
              public local: boolean) {}
}

export class StringSetValueEvent implements ValueChangedEvent {
  public name: string = "value";
  constructor(public src: RealTimeString,
              public sessionId: string,
              public username: string,
              public local: boolean) {}
}
