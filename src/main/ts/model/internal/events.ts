import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {ModelNode} from "./ModelNode";
import {Path} from "../ot/Path";
import {ArrayNode} from "./ArrayNode";
import {BooleanNode} from "./BooleanNode";
import {NumberNode} from "./NumberNode";
import {ObjectNode} from "./ObjectNode";
import {StringNode} from "./StringNode";

export interface ModelNodeEvent extends ConvergenceEvent {
  src: ModelNode<any>;
  local: boolean;
}

export interface NodeDetachedEvent extends ConvergenceEvent {
  src: ModelNode<any>;
}

export interface NodeValueChangedEvent extends ModelNodeEvent {
  sessionId: string;
  username: string;
}

export interface NodeChangedEvent extends ModelNodeEvent {
  relativePath: Path;
  childEvent: NodeValueChangedEvent;
}

export interface ArrayNodeInsertEvent extends NodeValueChangedEvent {
  src: ArrayNode;
  index: number;
  value: any;
}

export interface ArrayNodeRemoveEvent extends NodeValueChangedEvent {
  src: ArrayNode;
  index: number;
}

export interface ArrayNodeSetEvent extends NodeValueChangedEvent {
  src: ArrayNode;
  index: number;
  value: any;
}

export interface ArrayNodeReorderEvent extends NodeValueChangedEvent {
  src: ArrayNode;
  fromIndex: number;
  toIndex: any;
}

export interface ArrayNodeSetValueEvent extends NodeValueChangedEvent {
  src: ArrayNode;
  value: Array<any>;
}


export interface BooleanNodeSetValueEvent extends NodeValueChangedEvent {
  src: BooleanNode;
  value:  boolean;
}

export interface NumberNodeSetValueEvent extends NodeValueChangedEvent {
  src: NumberNode;
  value:  number;
}

export interface NumberNodeAddEvent extends NodeValueChangedEvent {
  src: NumberNode;
  value:  number;
}


export interface ObjectNodeSetEvent extends NodeValueChangedEvent {
  src: ObjectNode;
  key: string;
  value: ModelNode<any>;
}

export interface ObjectNodeRemoveEvent extends NodeValueChangedEvent {
  src: ObjectNode;
  key: string;
}

export interface ObjectNodeSetValueEvent extends NodeValueChangedEvent {
  src: ObjectNode;
}

export interface StringNodeInsertEvent extends NodeValueChangedEvent {
  src: StringNode;
  index: number;
  value:  string;
}

export interface StringNodeRemoveEvent extends NodeValueChangedEvent {
  src: StringNode;
  index: number;
  value:  string;
}

export interface StringNodeSetValueEvent extends NodeValueChangedEvent {
  src: StringNode;
  value:  string;
}
