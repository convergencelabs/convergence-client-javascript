import {DataValue, DateValue} from "../dataValue";
import {Model} from "./Model";
import {ModelNode} from "./ModelNode";
import {UndefinedNode} from "./UndefinedNode";
import {NullNode} from "./NullNode";
import {StringNode} from "./StringNode";
import {StringValue} from "../dataValue";
import {ArrayNode} from "./ArrayNode";
import {ArrayValue} from "../dataValue";
import {ObjectNode} from "./ObjectNode";
import {ObjectValue} from "../dataValue";
import {NumberNode} from "./NumberNode";
import {NumberValue} from "../dataValue";
import {BooleanValue} from "../dataValue";
import {BooleanNode} from "./BooleanNode";
import {Path} from "../Path";
import {DataValueFactory} from "../DataValueFactory";
import {DateNode} from "./DateNode";

export class ModelNodeFactory {

  public static create(data: DataValue,
                       path: () => Path,
                       model: Model, sessionId: string,
                       username: string,
                       dataValueFactory?: DataValueFactory): ModelNode<any> {

    if (data === undefined) {
      return new UndefinedNode(undefined, path, model, sessionId, username);
    }

    const type: string = data.type;
    if (type === "null") {
      return new NullNode(data.id, path, model, sessionId, username);
    } else if (type === "string") {
      return new StringNode(<StringValue> data, path, model, sessionId, username);
    } else if (type === "array") {
      return new ArrayNode(<ArrayValue> data, path, model, sessionId, username, dataValueFactory);
    } else if (type === "object") {
      return new ObjectNode(<ObjectValue> data, path, model, sessionId, username, dataValueFactory);
    } else if (type === "number") {
      return new NumberNode(<NumberValue> data, path, model, sessionId, username);
    } else if (type === "boolean") {
      return new BooleanNode(<BooleanValue> data, path, model, sessionId, username);
    } else if (type === "date") {
      return new DateNode(<DateValue> data, path, model, sessionId, username);
    } else {
      throw new Error("Invalid data type: " + type);
    }
  }
}
