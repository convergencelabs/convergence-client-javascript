import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {ModelNode} from "./ModelNode";
import {Path} from "../Path";
import {ArrayNode} from "./ArrayNode";
import {BooleanNode} from "./BooleanNode";
import {NumberNode} from "./NumberNode";
import {ObjectNode} from "./ObjectNode";
import {StringNode} from "./StringNode";

export interface ModelNodeEvent extends ConvergenceEvent {
  src: ModelNode<any>;
  local: boolean;
}

export class NodeDetachedEvent implements ModelNodeEvent {
  public static readonly NAME = "detached";
  public name: string = NodeDetachedEvent.NAME;

  constructor(public src: ModelNode<any>,
              public local: boolean) {}
}

export interface NodeValueChangedEvent extends ModelNodeEvent {
   sessionId: string;
   username: string;
}

export class NodeChangedEvent implements ModelNodeEvent {
  public static readonly NAME = "node_changed";
  public name: string = NodeChangedEvent.NAME;

  constructor(public readonly src: ModelNode<any>,
              public readonly local: boolean,
              public readonly relativePath: Path,
              public readonly childEvent: NodeValueChangedEvent,
              public readonly sessionId: string,
              public readonly username: string) {
    Object.freeze(this);
  }
}

export class ArrayNodeInsertEvent implements NodeValueChangedEvent {
  public static readonly NAME = "insert";
  public name: string = ArrayNodeInsertEvent.NAME;

  constructor(public readonly src: ArrayNode,
              public readonly local: boolean,
              public readonly index: number,
              public readonly value: ModelNode<any>,
              public readonly sessionId: string,
              public readonly username: string) {
    Object.freeze(this);
  }
}

export class ArrayNodeRemoveEvent implements NodeValueChangedEvent {
  public static readonly NAME = "remove";
  public name: string = ArrayNodeRemoveEvent.NAME;

  constructor(public readonly src: ArrayNode,
              public readonly local: boolean,
              public readonly index: number,
              public readonly sessionId: string,
              public readonly username: string) {
    Object.freeze(this);
  }
}

export class ArrayNodeSetEvent implements NodeValueChangedEvent {
  public static readonly NAME = "set";
  public name: string = ArrayNodeSetEvent.NAME;

  constructor(public readonly src: ArrayNode,
              public readonly local: boolean,
              public readonly index: number,
              public readonly value: ModelNode<any>,
              public readonly sessionId: string,
              public readonly username: string) {
    Object.freeze(this);
  }
}

export class ArrayNodeReorderEvent implements NodeValueChangedEvent {
  public static readonly NAME = "reorder";
  public name: string = ArrayNodeReorderEvent.NAME;

  constructor(public readonly src: ArrayNode,
              public readonly local: boolean,
              public readonly fromIndex: number,
              public readonly toIndex: number,
              public readonly sessionId: string,
              public readonly username: string) {
    Object.freeze(this);
  }
}

export class ArrayNodeSetValueEvent implements NodeValueChangedEvent {
  public static readonly NAME = "value";
  public name: string = ArrayNodeSetValueEvent.NAME;

  constructor(public readonly src: ArrayNode,
              public readonly local: boolean,
              public readonly value: any[],
              public readonly sessionId: string,
              public readonly username: string) {
    Object.freeze(this);
  }
}

export class BooleanNodeSetValueEvent implements NodeValueChangedEvent {
  public static readonly NAME = "value";
  public name: string = BooleanNodeSetValueEvent.NAME;

  constructor(public readonly src: BooleanNode,
              public readonly local: boolean,
              public readonly value: boolean,
              public readonly sessionId: string,
              public readonly username: string) {
    Object.freeze(this);
  }
}

export class NumberNodeSetValueEvent implements NodeValueChangedEvent {
  public static readonly NAME = "value";
  public name: string = NumberNodeSetValueEvent.NAME;

  constructor(public readonly src: NumberNode,
              public readonly local: boolean,
              public readonly value: number,
              public readonly sessionId: string,
              public readonly username: string) {
    Object.freeze(this);
  }
}

export class NumberNodeDeltaEvent implements NodeValueChangedEvent {
  public static readonly NAME = "delta";
  public name: string = NumberNodeDeltaEvent.NAME;

  constructor(public readonly src: NumberNode,
              public readonly local: boolean,
              public readonly value: number,
              public readonly sessionId: string,
              public readonly username: string) {
    Object.freeze(this);
  }
}

export class ObjectNodeSetEvent implements NodeValueChangedEvent {
  public static readonly NAME = "set";
  public name: string = ObjectNodeSetEvent.NAME;

  constructor(public readonly src: ObjectNode,
              public readonly local: boolean,
              public readonly key: string,
              public readonly value: ModelNode<any>,
              public readonly sessionId: string,
              public readonly username: string) {
    Object.freeze(this);
  }
}

export class ObjectNodeRemoveEvent implements NodeValueChangedEvent {
  public static readonly NAME = "remove";
  public name: string = ObjectNodeRemoveEvent.NAME;

  constructor(public src: ObjectNode,
              public local: boolean,
              public key: string,
              public sessionId: string,
              public username: string) {
    Object.freeze(this);
  }
}

export class ObjectNodeSetValueEvent implements NodeValueChangedEvent {
  public static readonly NAME = "value";
  public name: string = ObjectNodeSetValueEvent.NAME;

  constructor(public src: ObjectNode,
              public local: boolean,
              public value: { [key: string]: any; },
              public sessionId: string,
              public username: string) {
    Object.freeze(this);
  }
}

export class StringNodeInsertEvent implements NodeValueChangedEvent {
  public static readonly NAME = "insert";
  public name: string = StringNodeInsertEvent.NAME;

  constructor(public src: StringNode,
              public local: boolean,
              public index: number,
              public value: string,
              public sessionId: string,
              public username: string) {
    Object.freeze(this);
  }
}

export class StringNodeRemoveEvent implements NodeValueChangedEvent {
  public static readonly NAME = "remove";
  public name: string = StringNodeRemoveEvent.NAME;

  constructor(public src: StringNode,
              public local: boolean,
              public index: number,
              public value: string,
              public sessionId: string,
              public username: string) {
    Object.freeze(this);
  }
}

export class StringNodeSetValueEvent implements NodeValueChangedEvent {
  public static readonly NAME = "value";
  public name: string = StringNodeSetValueEvent.NAME;

  constructor(public src: StringNode,
              public local: boolean,
              public value: string,
              public sessionId: string,
              public username: string) {
    Object.freeze(this);
  }
}
