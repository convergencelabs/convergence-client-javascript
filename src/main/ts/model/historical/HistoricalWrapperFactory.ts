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
import {HistoricalElement} from "./HistoricalElement";
import {HistoricalArray} from "./HistoricalArray";
import {HistoricalObject} from "./HistoricalObject";
import {HistoricalBoolean} from "./HistoricalBoolean";
import {HistoricalNull} from "./HistoricalNull";
import {HistoricalNumber} from "./HistoricalNumber";
import {HistoricalString} from "./HistoricalString";
import {HistoricalUndefined} from "./HistoricalUndefined";
import {HistoricalModel} from "./HistoricalModel";
import {HistoricalDate} from "./HistoricalDate";
import {DateNode} from "../internal/DateNode";

export class HistoricalWrapperFactory extends NodeWrapperFactory<HistoricalElement<any>> {

  constructor(private _model: HistoricalModel) {
    super();
  }

  protected _createWrapper(node: ModelNode<any>): HistoricalElement<any> {
    switch (node.type()) {
      case ModelElementType.ARRAY:
        return new HistoricalArray(<ArrayNode> node, this, this._model);
      case ModelElementType.OBJECT:
        return new HistoricalObject(<ObjectNode> node, this, this._model);
      case ModelElementType.BOOLEAN:
          return new HistoricalBoolean(<BooleanNode> node, this, this._model);
      case ModelElementType.NULL:
        return new HistoricalNull(<NullNode> node, this, this._model);
      case ModelElementType.NUMBER:
        return new HistoricalNumber(<NumberNode> node, this, this._model);
      case ModelElementType.STRING:
        return new HistoricalString(<StringNode> node, this, this._model);
      case ModelElementType.UNDEFINED:
        return new HistoricalUndefined(<UndefinedNode> node, this, this._model);
      case ModelElementType.DATE:
        return new HistoricalDate(<DateNode> node, this, this._model);
      default:
        return null;
      }
  }
}
