import {NodeWrapperFactory} from "../internal/NodeWrapperFactory";
import {ModelNode} from "../internal/ModelNode";
import {ModelElementType} from "../ModelElementType";
import {ArrayNode} from "../internal/ArrayNode";
import {ObjectNode} from "../internal/ObjectNode";
import {BooleanNode} from "../internal/BooleanNode";
import {NullNode} from "../internal/NullNode";
import {NumberNode} from "../internal/NumberNode";
import {StringNode} from "../internal/StringNode";
import {UndefinedNode} from "../internal/UndefinedNode";
import {HistoricalValue} from "./HistoricalValue";
import {HistoricalArray} from "./HistoricalArray";
import {HistoricalObject} from "./HistoricalObject";
import {HistoricalBoolean} from "./HistoricalBoolean";
import {HistoricalNull} from "./HistoricalNull";
import {HistoricalNumber} from "./HistoricalNumber";
import {HistoricalString} from "./HistoricalString";
import {HistoricalUndefined} from "./HistoricalUndefined";

export class HistoricalWrapperFactory extends NodeWrapperFactory<HistoricalValue<any>> {

  constructor() {
    super();
  }

  protected _createWrapper(node: ModelNode<any>): HistoricalValue<any> {
    switch (node.type()) {
      case ModelElementType.Array:
        return new HistoricalArray(<ArrayNode> node, this);
      case ModelElementType.Object:
        return new HistoricalObject(<ObjectNode> node, this);
      case ModelElementType.Boolean:
          return new HistoricalBoolean(<BooleanNode> node, this);
      case ModelElementType.Null:
        return new HistoricalNull(<NullNode> node, this);
      case ModelElementType.Number:
        return new HistoricalNumber(<NumberNode> node, this);
      case ModelElementType.String:
        return new HistoricalString(<StringNode> node, this);
      case ModelElementType.Undefined:
        return new HistoricalUndefined(<UndefinedNode> node, this);
      default:
        return null;
      }
  }
}
