import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {Path} from "../ot/Path";

import {DataValue} from "../dataValue";
import {RealTimeValue} from "./RealTimeValue";
import {RealTimeArray} from "./RealTimeArray";
import {RealTimeBoolean} from "./RealTimeBoolean";
import {RealTimeNumber} from "./RealTimeNumber";
import {RealTimeObject} from "./RealTimeObject";
import {RealTimeString} from "./RealTimeString";
import {ModelReference} from "../reference/ModelReference";

export interface RemoteReferenceCreatedEvent extends ConvergenceEvent {
  reference: ModelReference<any>;
}

export interface ConvergenceModelValueEvent extends ConvergenceEvent {
  src: RealTimeValue<any>;
}

export class ValueDetachedEvent implements ConvergenceEvent {
  public name: string = "detached";
  constructor(public src: RealTimeValue<any>) {}
}

export interface ValueChangedEvent extends ConvergenceModelValueEvent {
  sessionId: string;
  username: string;
}

export class ModelChangedEvent implements ConvergenceModelValueEvent {

  public name: string = "model_changed";
  constructor(public src: RealTimeValue<any>,
              public relativePath: Path,
              public childEvent: ValueChangedEvent,
              public sessionId: string,
              public username: string) {}
}

export class ArrayInsertEvent implements ValueChangedEvent {
  public name: string = "insert";
  constructor(public src: RealTimeArray,
              public index: number,
              public value: RealTimeValue<any>,
              public sessionId: string,
              public username: string) {}
}

export class ArrayRemoveEvent implements ValueChangedEvent {
  public name: string = "remove";
  constructor(public src: RealTimeArray,
              public index: number,
              public sessionId: string,
              public username: string) {}
}

export class ArraySetEvent implements ValueChangedEvent {
  public name: string = "set";
  constructor(public src: RealTimeArray,
              public index: number,
              public value: any,
              public sessionId: string,
              public username: string) {}
}

export class ArrayReorderEvent implements ValueChangedEvent {
  public name: string = "reorder";
  constructor(public src: RealTimeArray,
              public fromIndex: number,
              public toIndex: number,
              public sessionId: string,
              public username: string) {}
}

export class ArraySetValueEvent implements ValueChangedEvent {
  public name: string = "value";
  constructor(public src: RealTimeArray,
              public value: Array<any>,
              public sessionId: string,
              public username: string) {}
}


export class BooleanSetValueEvent implements ValueChangedEvent {
  public name: string = "value";
  constructor(public src: RealTimeBoolean,
              public value: boolean,
              public sessionId: string,
              public username: string) {}
}

export class NumberSetValueEvent implements ValueChangedEvent {
  public name: string = "value";
  constructor(public src: RealTimeNumber,
              public value: number,
              public sessionId: string,
              public username: string) {}
}

export class NumberAddEvent implements ValueChangedEvent {
  public name: string = "add";
  constructor(public src: RealTimeNumber,
              public value: number,
              public sessionId: string,
              public username: string) {}
}


export class ObjectSetEvent implements ValueChangedEvent {
  public name: string = "set";
  constructor(public src: RealTimeObject,
              public key: string,
              public value: RealTimeValue<any>,
              public sessionId: string,
              public username: string) {}
}

export class ObjectRemoveEvent implements ValueChangedEvent {
  public name: string = "remove";
  constructor(public src: RealTimeObject,
              public key: string,
              public sessionId: string,
              public username: string) {}
}

export class ObjectSetValueEvent implements ValueChangedEvent {
  public name: string = "value";
  constructor(public src: RealTimeObject,
              public value: {[key: string]: any;},
              public sessionId: string,
              public username: string) {}
}

export class NodeSetValueEvent implements ValueChangedEvent {
  public name: string = "value";
  constructor(public src: RealTimeObject,
              public sessionId: string,
              public username: string) {}
}

export class StringInsertEvent implements ValueChangedEvent {
  public name: string = "insert";
  constructor(public src: RealTimeString,
              public index: number,
              public value: string,
              public sessionId: string,
              public username: string) {}
}

export class StringRemoveEvent implements ValueChangedEvent {
  public name: string = "remove";
  constructor(public src: RealTimeString,
              public index: number,
              public value: string,
              public sessionId: string,
              public username: string) {}
}

export class StringSetValueEvent implements ValueChangedEvent {
  public name: string = "value";
  constructor(public src: RealTimeString,
              public value: string,
              public sessionId: string,
              public username: string) {}
}
