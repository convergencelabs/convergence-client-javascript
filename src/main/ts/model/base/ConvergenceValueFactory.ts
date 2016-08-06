import {ConvergenceContainerValue} from "./ConvergenceContainerValue";
import {PathElement} from ".././ot/Path";
import {DataValue} from ".././dataValue";
import {StringValue} from ".././dataValue";
import {ArrayValue} from ".././dataValue";
import {ObjectValue} from ".././dataValue";
import {NumberValue} from ".././dataValue";
import {BooleanValue} from ".././dataValue";
import {ConvergenceModel} from "./ConvergenceModel";
import {ValueFactory} from "./ValueFactory";
import {ConvergenceObject} from "./ConvergneceObject";
import {ConvergenceArray} from "./ConvergenceArray";
import {ConvergenceValue} from "./ConvergenceValue";
import ConvergenceNull from "./ConvergenceNull";
import ConvergenceUndefined from "./ConvergenceUndefined";
import ConvergenceString from "./ConvergenceString";
import ConvergenceNumber from "./ConvergenceNumber";
import ConvergenceBoolean from "./ConvergenceBoolean";

export class ConvergenceValueFactory implements ValueFactory {

  private _model: ConvergenceModel;

  constructor(model: ConvergenceModel) {
    this._model = model;
  }

  public create(data: DataValue,
                parent: ConvergenceContainerValue<any>,
                fieldInParent: PathElement): ConvergenceValue<any> {

    if (data === undefined) {
      return new ConvergenceUndefined(undefined, parent, fieldInParent, this._model);
    }

    var type: string = data.type;
    if (type === "null") {
      return new ConvergenceNull(data.id, parent, fieldInParent, this, this._model);
    } else if (type === "string") {
      return new ConvergenceString(<StringValue>data, parent, fieldInParent, this._model);
    } else if (type === "array") {
      return new ConvergenceArray(<ArrayValue>data, parent, fieldInParent, this, this._model);
    } else if (type === "object") {
      return new ConvergenceObject(<ObjectValue>data, parent, fieldInParent, this, this._model);
    } else if (type === "number") {
      return new ConvergenceNumber(<NumberValue>data, parent, fieldInParent, this._model);
    } else if (type === "boolean") {
      return new ConvergenceBoolean(<BooleanValue>data, parent, fieldInParent, this._model);
    } else {
      throw new Error("Invalid data type: " + type);
    }
  }
}
