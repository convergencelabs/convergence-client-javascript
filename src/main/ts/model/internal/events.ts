import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {ModelNode} from "./ModelNode";
import {Path} from "../ot/Path";
import {ArrayNode} from "./ArrayNode";
import {BooleanNode} from "./BooleanNode";
import {NumberNode} from "./NumberNode";
import {ObjectNode} from "./ObjectNode";
import {StringNode} from "./StringNode";
import {DataValue} from "../dataValue";

export interface ModelNodeEvent extends ConvergenceEvent {
  src: ModelNode<any>;
  local: boolean;
}

export class NodeDetachedEvent implements ConvergenceEvent {
  public name: string = "detached";
  constructor(public src: ModelNode<any>) {}
}

export interface NodeValueChangedEvent extends ModelNodeEvent {
  sessionId: string;
  username: string;
}

export class NodeChangedEvent implements ModelNodeEvent {

  public name: string = "node_changed";
  constructor(public src: ModelNode<any>,
              public local: boolean,
              public relativePath: Path,
              public childEvent: NodeValueChangedEvent,
              public sessionId: string,
              public username: string) {}
}

export class ArrayNodeInsertEvent implements NodeValueChangedEvent {
  public name: string = "insert";
  constructor(public src: ArrayNode,
              public local: boolean,
              public index: number,
              public value: ModelNode<any>,
              public sessionId: string,
              public username: string) {}
}

export class ArrayNodeRemoveEvent implements NodeValueChangedEvent {
  public name: string = "remove";
  constructor(public src: ArrayNode,
              public local: boolean,
              public index: number,
              public sessionId: string,
              public username: string) {}
}

export class ArrayNodeSetEvent implements NodeValueChangedEvent {
  public name: string = "set";
  constructor(public src: ArrayNode,
              public local: boolean,
              public index: number,
              public value: any,
              public sessionId: string,
              public username: string) {}
}

export class ArrayNodeReorderEvent implements NodeValueChangedEvent {
  public name: string = "reorder";
  constructor(public src: ArrayNode,
              public local: boolean,
              public fromIndex: number,
              public toIndex: number,
              public sessionId: string,
              public username: string) {}
}

export class ArrayNodeSetValueEvent implements NodeValueChangedEvent {
  public name: string = "value";
  constructor(public src: ArrayNode,
              public local: boolean,
              public value: Array<any>,
              public sessionId: string,
              public username: string) {}
}


export class BooleanNodeSetValueEvent implements NodeValueChangedEvent {
  public name: string = "value";
  constructor(public src: BooleanNode,
              public local: boolean,
              public value: boolean,
              public sessionId: string,
              public username: string) {}
}

export class NumberNodeSetValueEvent implements NodeValueChangedEvent {
  public name: string = "value";
  constructor(public src: NumberNode,
              public local: boolean,
              public value: number,
              public sessionId: string,
              public username: string) {}
}

export class NumberNodeAddEvent implements NodeValueChangedEvent {
  public name: string = "add";
  constructor(public src: NumberNode,
              public local: boolean,
              public value: number,
              public sessionId: string,
              public username: string) {}
}


export class ObjectNodeSetEvent implements NodeValueChangedEvent {
  public name: string = "set";
  constructor(public src: ObjectNode,
              public local: boolean,
              public key: string,
              public value: ModelNode<any>,
              public sessionId: string,
              public username: string) {}
}

export class ObjectNodeRemoveEvent implements NodeValueChangedEvent {
  public name: string = "remove";
  constructor(public src: ObjectNode,
              public local: boolean,
              public key: string,
              public sessionId: string,
              public username: string) {}
}

export class ObjectNodeSetValueEvent implements NodeValueChangedEvent {
  public name: string = "value";
  constructor(public src: ObjectNode,
              public local: boolean,
              public value: {[key: string]: any;},
              public sessionId: string,
              public username: string) {}
}

export class StringNodeInsertEvent implements NodeValueChangedEvent {
  public name: string = "insert";
  constructor(public src: StringNode,
              public local: boolean,
              public index: number,
              public value: string,
              public sessionId: string,
              public username: string) {}
}

export class StringNodeRemoveEvent implements NodeValueChangedEvent {
  public name: string = "remove";
  constructor(public src: StringNode,
              public local: boolean,
              public index: number,
              public value: string,
              public sessionId: string,
              public username: string) {}
}

export class StringNodeSetValueEvent implements NodeValueChangedEvent {
  public name: string = "value";
  constructor(public src: StringNode,
              public local: boolean,
              public value: string,
              public sessionId: string,
              public username: string) {}
}
