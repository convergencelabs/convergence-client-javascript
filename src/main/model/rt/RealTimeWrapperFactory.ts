/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {NodeWrapperFactory} from "../internal/NodeWrapperFactory";
import {RealTimeElement} from "./RealTimeElement";
import {ModelNode} from "../internal/ModelNode";
import {ModelElementType} from "../ModelElementType";
import {RealTimeArray} from "./RealTimeArray";
import {ArrayNode} from "../internal/ArrayNode";
import {ObjectNode} from "../internal/ObjectNode";
import {RealTimeObject} from "./RealTimeObject";
import {RealTimeBoolean} from "./RealTimeBoolean";
import {BooleanNode} from "../internal/BooleanNode";
import {RealTimeNull} from "./RealTimeNull";
import {NullNode} from "../internal/NullNode";
import {RealTimeNumber} from "./RealTimeNumber";
import {NumberNode} from "../internal/NumberNode";
import {RealTimeString} from "./RealTimeString";
import {StringNode} from "../internal/StringNode";
import {UndefinedNode} from "../internal/UndefinedNode";
import {RealTimeUndefined} from "./RealTimeUndefined";
import {RealTimeModel} from "./RealTimeModel";
import {RealTimeDate} from "./RealTimeDate";
import {DateNode} from "../internal/DateNode";
import {IdentityCache} from "../../identity/IdentityCache";

/**
 * @hidden
 * @internal
 */
export class RealTimeWrapperFactory extends NodeWrapperFactory<RealTimeElement<any>> {

  constructor(private _callbacks: any, private _model: RealTimeModel, private _identityCache: IdentityCache) {
    super();
  }

  protected _createWrapper(node: ModelNode<any>): RealTimeElement<any> {
    switch (node.type()) {
      case ModelElementType.ARRAY:
        return new RealTimeArray(node as ArrayNode, this._callbacks, this, this._model, this._identityCache);
      case ModelElementType.OBJECT:
        return new RealTimeObject(node as ObjectNode, this._callbacks, this, this._model, this._identityCache);
      case ModelElementType.BOOLEAN:
          return new RealTimeBoolean(node as BooleanNode, this._callbacks, this, this._model, this._identityCache);
      case ModelElementType.NULL:
        return new RealTimeNull(node as NullNode, this._callbacks, this, this._model, this._identityCache);
      case ModelElementType.NUMBER:
        return new RealTimeNumber(node as NumberNode, this._callbacks, this, this._model, this._identityCache);
      case ModelElementType.STRING:
        return new RealTimeString(node as StringNode, this._callbacks, this, this._model, this._identityCache);
      case ModelElementType.UNDEFINED:
        return new RealTimeUndefined(node as UndefinedNode, this._callbacks, this, this._model, this._identityCache);
      case ModelElementType.DATE:
        return new RealTimeDate(node as DateNode, this._callbacks, this, this._model, this._identityCache);
      default:
        return null;
      }
  }
}
