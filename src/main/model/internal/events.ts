/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {IConvergenceEvent} from "../../util";
import {ModelNode} from "./ModelNode";
import {Path} from "../Path";
import {ArrayNode} from "./ArrayNode";
import {BooleanNode} from "./BooleanNode";
import {NumberNode} from "./NumberNode";
import {ObjectNode} from "./ObjectNode";
import {StringNode} from "./StringNode";
import {DateNode} from "./DateNode";
import {DomainUser} from "../../identity";

/**
 * @hidden
 * @internal
 */
export interface ModelNodeEvent extends IConvergenceEvent {
  src: ModelNode<any>;
  local: boolean;
}

/**
 * @hidden
 * @internal
 */
export class NodeDetachedEvent implements ModelNodeEvent {
  public static readonly NAME = "detached";
  public name: string = NodeDetachedEvent.NAME;

  constructor(public readonly src: ModelNode<any>,
              public readonly local: boolean) {}
}

/**
 * @hidden
 * @internal
 */
export interface NodeValueChangedEvent extends ModelNodeEvent {
   sessionId: string;
   user: DomainUser;
}

/**
 * @hidden
 * @internal
 */
export class NodeChangedEvent implements ModelNodeEvent {
  public static readonly NAME = "node_changed";
  public name: string = NodeChangedEvent.NAME;

  constructor(public readonly src: ModelNode<any>,
              public readonly local: boolean,
              public readonly relativePath: Path,
              public readonly childEvent: NodeValueChangedEvent,
              public readonly sessionId: string,
              public readonly user: DomainUser) {
    Object.freeze(this);
  }
}

/**
 * @hidden
 * @internal
 */
export class ArrayNodeInsertEvent implements NodeValueChangedEvent {
  public static readonly NAME = "insert";
  public name: string = ArrayNodeInsertEvent.NAME;

  constructor(public readonly src: ArrayNode,
              public readonly local: boolean,
              public readonly index: number,
              public readonly value: ModelNode<any>,
              public readonly sessionId: string,
              public readonly user: DomainUser) {
    Object.freeze(this);
  }
}

/**
 * @hidden
 * @internal
 */
export class ArrayNodeRemoveEvent implements NodeValueChangedEvent {
  public static readonly NAME = "remove";
  public name: string = ArrayNodeRemoveEvent.NAME;

  constructor(public readonly src: ArrayNode,
              public readonly local: boolean,
              public readonly index: number,
              public readonly oldValue: ModelNode<any>,
              public readonly sessionId: string,
              public readonly user: DomainUser) {
    Object.freeze(this);
  }
}

/**
 * @hidden
 * @internal
 */
export class ArrayNodeSetEvent implements NodeValueChangedEvent {
  public static readonly NAME = "set";
  public name: string = ArrayNodeSetEvent.NAME;

  constructor(public readonly src: ArrayNode,
              public readonly local: boolean,
              public readonly index: number,
              public readonly value: ModelNode<any>,
              public readonly oldValue: ModelNode<any>,
              public readonly sessionId: string,
              public readonly user: DomainUser) {
    Object.freeze(this);
  }
}

/**
 * @hidden
 * @internal
 */
export class ArrayNodeReorderEvent implements NodeValueChangedEvent {
  public static readonly NAME = "reorder";
  public name: string = ArrayNodeReorderEvent.NAME;

  constructor(public readonly src: ArrayNode,
              public readonly local: boolean,
              public readonly fromIndex: number,
              public readonly toIndex: number,
              public readonly sessionId: string,
              public readonly user: DomainUser) {
    Object.freeze(this);
  }
}

/**
 * @hidden
 * @internal
 */
export class ArrayNodeSetValueEvent implements NodeValueChangedEvent {
  public static readonly NAME = "value";
  public name: string = ArrayNodeSetValueEvent.NAME;

  constructor(public readonly src: ArrayNode,
              public readonly local: boolean,
              public readonly value: any[],
              public readonly sessionId: string,
              public readonly user: DomainUser) {
    Object.freeze(this);
  }
}

/**
 * @hidden
 * @internal
 */
export class BooleanNodeSetValueEvent implements NodeValueChangedEvent {
  public static readonly NAME = "value";
  public name: string = BooleanNodeSetValueEvent.NAME;

  constructor(public readonly src: BooleanNode,
              public readonly local: boolean,
              public readonly value: boolean,
              public readonly sessionId: string,
              public readonly user: DomainUser) {
    Object.freeze(this);
  }
}

/**
 * @hidden
 * @internal
 */
export class NumberNodeSetValueEvent implements NodeValueChangedEvent {
  public static readonly NAME = "value";
  public name: string = NumberNodeSetValueEvent.NAME;

  constructor(public readonly src: NumberNode,
              public readonly local: boolean,
              public readonly value: number,
              public readonly sessionId: string,
              public readonly user: DomainUser) {
    Object.freeze(this);
  }
}

/**
 * @hidden
 * @internal
 */
export class NumberNodeDeltaEvent implements NodeValueChangedEvent {
  public static readonly NAME = "delta";
  public name: string = NumberNodeDeltaEvent.NAME;

  constructor(public readonly src: NumberNode,
              public readonly local: boolean,
              public readonly value: number,
              public readonly sessionId: string,
              public readonly user: DomainUser) {
    Object.freeze(this);
  }
}

/**
 * @hidden
 * @internal
 */
export class ObjectNodeSetEvent implements NodeValueChangedEvent {
  public static readonly NAME = "set";
  public name: string = ObjectNodeSetEvent.NAME;

  constructor(public readonly src: ObjectNode,
              public readonly local: boolean,
              public readonly key: string,
              public readonly value: ModelNode<any>,
              public readonly oldValue: ModelNode<any>,
              public readonly sessionId: string,
              public readonly user: DomainUser) {
    Object.freeze(this);
  }
}

/**
 * @hidden
 * @internal
 */
export class ObjectNodeRemoveEvent implements NodeValueChangedEvent {
  public static readonly NAME = "remove";
  public name: string = ObjectNodeRemoveEvent.NAME;

  constructor(public readonly src: ObjectNode,
              public readonly local: boolean,
              public readonly key: string,
              public readonly oldValue: ModelNode<any>,
              public readonly sessionId: string,
              public readonly user: DomainUser) {
    Object.freeze(this);
  }
}

/**
 * @hidden
 * @internal
 */
export class ObjectNodeSetValueEvent implements NodeValueChangedEvent {
  public static readonly NAME = "value";
  public name: string = ObjectNodeSetValueEvent.NAME;

  constructor(public readonly src: ObjectNode,
              public readonly local: boolean,
              public readonly value: { [key: string]: any; },
              public readonly sessionId: string,
              public readonly user: DomainUser) {
    Object.freeze(this);
  }
}

/**
 * @hidden
 * @internal
 */
export class StringNodeInsertEvent implements NodeValueChangedEvent {
  public static readonly NAME = "insert";
  public name: string = StringNodeInsertEvent.NAME;

  constructor(public readonly src: StringNode,
              public readonly local: boolean,
              public readonly index: number,
              public readonly value: string,
              public readonly sessionId: string,
              public readonly user: DomainUser) {
    Object.freeze(this);
  }
}

/**
 * @hidden
 * @internal
 */
export class StringNodeRemoveEvent implements NodeValueChangedEvent {
  public static readonly NAME = "remove";
  public name: string = StringNodeRemoveEvent.NAME;

  constructor(public readonly src: StringNode,
              public readonly local: boolean,
              public readonly index: number,
              public readonly value: string,
              public readonly sessionId: string,
              public readonly user: DomainUser) {
    Object.freeze(this);
  }
}

/**
 * @hidden
 * @internal
 */
export class StringNodeSetValueEvent implements NodeValueChangedEvent {
  public static readonly NAME = "value";
  public name: string = StringNodeSetValueEvent.NAME;

  constructor(public readonly src: StringNode,
              public readonly local: boolean,
              public readonly value: string,
              public readonly sessionId: string,
              public readonly user: DomainUser) {
    Object.freeze(this);
  }
}

/**
 * @hidden
 * @internal
 */
export class DateNodeSetValueEvent implements NodeValueChangedEvent {
  public static readonly NAME = "value";
  public name: string = DateNodeSetValueEvent.NAME;

  constructor(public readonly src: DateNode,
              public readonly local: boolean,
              public readonly value: Date,
              public readonly sessionId: string,
              public readonly user: DomainUser) {
    Object.freeze(this);
  }
}
