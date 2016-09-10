import {NodeWrapperFactory} from "../internal/NodeWrapperFactory";
import {ModelNode} from "../internal/ModelNode";
import {ModelValueType} from "../ModelValueType";
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
      case ModelValueType.Array:
        return new HistoricalArray(<ArrayNode> node, this);
      case ModelValueType.Object:
        return new HistoricalObject(<ObjectNode> node, this);
      case ModelValueType.Boolean:
          return new HistoricalBoolean(<BooleanNode> node);
      case ModelValueType.Null:
        return new HistoricalNull(<NullNode> node);
      case ModelValueType.Number:
        return new HistoricalNumber(<NumberNode> node);
      case ModelValueType.String:
        return new HistoricalString(<StringNode> node);
      case ModelValueType.Undefined:
        return new HistoricalUndefined(<UndefinedNode> node);
      default:
        return null;
      }
  }
}
