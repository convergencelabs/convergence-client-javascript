import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {Path} from "../ot/Path";

import {HistoricalValue} from "./HistoricalValue";
import {HistoricalArray} from "./HistoricalArray";
import {HistoricalBoolean} from "./HistoricalBoolean";
import {HistoricalNumber} from "./HistoricalNumber";
import {HistoricalObject} from "./HistoricalObject";
import {HistoricalString} from "./HistoricalString";

export interface ConvergenceModelValueEvent extends ConvergenceEvent {
  src: HistoricalValue<any>;
}

export class ValueDetachedEvent implements ConvergenceEvent {
  public name: string = "detached";

  constructor(public src: HistoricalValue<any>) {
  }
}

export interface ValueChangedEvent extends ConvergenceModelValueEvent {
  sessionId: string;
  username: string;
}

export class ModelChangedEvent implements ConvergenceModelValueEvent {

  public name: string = "model_changed";

  constructor(public src: HistoricalValue<any>,
              public relativePath: Path,
              public childEvent: ValueChangedEvent,
              public sessionId: string,
              public username: string) {
  }
}

export class ArrayInsertEvent implements ValueChangedEvent {
  public name: string = "insert";

  constructor(public src: HistoricalArray,
              public index: number,
              public value: HistoricalValue<any>,
              public sessionId: string,
              public username: string) {
  }
}

export class ArrayRemoveEvent implements ValueChangedEvent {
  public name: string = "remove";

  constructor(public src: HistoricalArray,
              public index: number,
              public sessionId: string,
              public username: string) {
  }
}

export class ArraySetEvent implements ValueChangedEvent {
  public name: string = "set";

  constructor(public src: HistoricalArray,
              public index: number,
              public value: any,
              public sessionId: string,
              public username: string) {
  }
}

export class ArrayReorderEvent implements ValueChangedEvent {
  public name: string = "reorder";

  constructor(public src: HistoricalArray,
              public fromIndex: number,
              public toIndex: number,
              public sessionId: string,
              public username: string) {
  }
}

export class ArraySetValueEvent implements ValueChangedEvent {
  public name: string = "value";

  constructor(public src: HistoricalArray,
              public value: Array<any>,
              public sessionId: string,
              public username: string) {
  }
}


export class BooleanSetValueEvent implements ValueChangedEvent {
  public name: string = "value";

  constructor(public src: HistoricalBoolean,
              public value: boolean,
              public sessionId: string,
              public username: string) {
  }
}

export class NumberSetValueEvent implements ValueChangedEvent {
  public name: string = "value";

  constructor(public src: HistoricalNumber,
              public value: number,
              public sessionId: string,
              public username: string) {
  }
}

export class NumberAddEvent implements ValueChangedEvent {
  public name: string = "add";

  constructor(public src: HistoricalNumber,
              public value: number,
              public sessionId: string,
              public username: string) {
  }
}


export class ObjectSetEvent implements ValueChangedEvent {
  public name: string = "set";

  constructor(public src: HistoricalObject,
              public key: string,
              public value: HistoricalValue<any>,
              public sessionId: string,
              public username: string) {
  }
}

export class ObjectRemoveEvent implements ValueChangedEvent {
  public name: string = "remove";

  constructor(public src: HistoricalObject,
              public key: string,
              public sessionId: string,
              public username: string) {
  }
}

export class ObjectSetValueEvent implements ValueChangedEvent {
  public name: string = "value";

  constructor(public src: HistoricalObject,
              public value: { [key: string]: any; },
              public sessionId: string,
              public username: string) {
  }
}

export class NodeSetValueEvent implements ValueChangedEvent {
  public name: string = "value";

  constructor(public src: HistoricalObject,
              public sessionId: string,
              public username: string) {
  }
}

export class StringInsertEvent implements ValueChangedEvent {
  public name: string = "insert";

  constructor(public src: HistoricalString,
              public index: number,
              public value: string,
              public sessionId: string,
              public username: string) {
  }
}

export class StringRemoveEvent implements ValueChangedEvent {
  public name: string = "remove";

  constructor(public src: HistoricalString,
              public index: number,
              public value: string,
              public sessionId: string,
              public username: string) {
  }
}

export class StringSetValueEvent implements ValueChangedEvent {
  public name: string = "value";

  constructor(public src: HistoricalString,
              public value: string,
              public sessionId: string,
              public username: string) {
  }
}
