import {NodeWrapperFactory} from "../internal/NodeWrapperFactory";
import {RealTimeValue} from "./RealTimeValue";
import {ModelNode} from "../internal/ModelNode";
import {ModelValueType} from "../ModelValueType";
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

export class RealTimeWrapperFactory extends NodeWrapperFactory<RealTimeValue<any>> {

  constructor(private _callbacks: any) {
    super();
  }

  protected _createWrapper(node: ModelNode<any>): RealTimeValue<any> {
    switch (node.type()) {
      case ModelValueType.Array:
        return new RealTimeArray(<ArrayNode> node, this._callbacks, this);
      case ModelValueType.Object:
        return new RealTimeObject(<ObjectNode> node, this._callbacks, this);
      case ModelValueType.Boolean:
          return new RealTimeBoolean(<BooleanNode> node, this._callbacks, this);
      case ModelValueType.Null:
        return new RealTimeNull(<NullNode> node, this._callbacks, this);
      case ModelValueType.Number:
        return new RealTimeNumber(<NumberNode> node, this._callbacks, this);
      case ModelValueType.String:
        return new RealTimeString(<StringNode> node, this._callbacks, this);
      case ModelValueType.Undefined:
        return new RealTimeUndefined(<UndefinedNode> node, this._callbacks, this);
      default:
        return null;
      }
  }
}
