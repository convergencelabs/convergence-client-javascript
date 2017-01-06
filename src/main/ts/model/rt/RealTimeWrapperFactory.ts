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

export class RealTimeWrapperFactory extends NodeWrapperFactory<RealTimeElement<any>> {

  constructor(private _callbacks: any, private _model: RealTimeModel) {
    super();
  }

  protected _createWrapper(node: ModelNode<any>): RealTimeElement<any> {
    switch (node.type()) {
      case ModelElementType.ARRAY:
        return new RealTimeArray(<ArrayNode> node, this._callbacks, this, this._model);
      case ModelElementType.OBJECT:
        return new RealTimeObject(<ObjectNode> node, this._callbacks, this, this._model);
      case ModelElementType.BOOLEAN:
          return new RealTimeBoolean(<BooleanNode> node, this._callbacks, this, this._model);
      case ModelElementType.NULL:
        return new RealTimeNull(<NullNode> node, this._callbacks, this, this._model);
      case ModelElementType.NUMBER:
        return new RealTimeNumber(<NumberNode> node, this._callbacks, this, this._model);
      case ModelElementType.STRING:
        return new RealTimeString(<StringNode> node, this._callbacks, this, this._model);
      case ModelElementType.UNDEFINED:
        return new RealTimeUndefined(<UndefinedNode> node, this._callbacks, this, this._model);
      default:
        return null;
      }
  }
}
