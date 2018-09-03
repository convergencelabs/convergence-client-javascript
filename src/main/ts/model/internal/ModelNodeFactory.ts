import {Model} from "./Model";
import {ModelNode} from "./ModelNode";
import {UndefinedNode} from "./UndefinedNode";
import {NullNode} from "./NullNode";
import {StringNode} from "./StringNode";
import {ArrayNode} from "./ArrayNode";
import {
  DataValue,
  DateValue,
  ArrayValue,
  StringValue,
  ObjectValue,
  NumberValue,
  BooleanValue} from "../dataValue";
import {ObjectNode} from "./ObjectNode";
import {NumberNode} from "./NumberNode";
import {BooleanNode} from "./BooleanNode";
import {Path} from "../Path";
import {DataValueFactory} from "../DataValueFactory";
import {DateNode} from "./DateNode";

/**
 * @hidden
 * @internal
 */
export class ModelNodeFactory {

  public static create(data: DataValue,
                       path: () => Path,
                       model: Model, sessionId: string,
                       username: string,
                       dataValueFactory?: DataValueFactory): ModelNode<any> {

    if (data === undefined) {
      return new UndefinedNode(undefined, path, sessionId, username);
    }

    const type: string = data.type;
    if (type === "null") {
      return new NullNode(data.id, path, model, sessionId, username);
    } else if (type === "string") {
      return new StringNode(data as StringValue, path, model, sessionId, username);
    } else if (type === "array") {
      return new ArrayNode(data as ArrayValue, path, model, sessionId, username, dataValueFactory);
    } else if (type === "object") {
      return new ObjectNode(data as ObjectValue, path, model, sessionId, username, dataValueFactory);
    } else if (type === "number") {
      return new NumberNode(data as NumberValue, path, model, sessionId, username);
    } else if (type === "boolean") {
      return new BooleanNode(data as BooleanValue, path, model, sessionId, username);
    } else if (type === "date") {
      return new DateNode(data as DateValue, path, model, sessionId, username);
    } else {
      throw new Error("Invalid data type: " + type);
    }
  }
}
