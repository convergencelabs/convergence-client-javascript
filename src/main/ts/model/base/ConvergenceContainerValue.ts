import {ConvergenceValue} from "./ConvergenceValue";
import {PathElement} from "../ot/Path";
import {Path} from "../ot/Path";
import {ConvergenceModel} from "./ConvergenceModel";
import {ValueFactory} from "./ValueFactory";
import {ConvergenceValueType} from "./ConvergenceValueType";

export abstract class ConvergenceContainerValue<T> extends ConvergenceValue<T> {


  protected _valueFactory: ValueFactory;

  /**
   * Constructs a new RealTimeContainer.
   */
  constructor(type: ConvergenceValueType,
              id: string,
              parent: ConvergenceContainerValue<any>,
              fieldInParent: PathElement,
              valueFactory: ValueFactory,
              model: ConvergenceModel) {
    super(type, id, parent, fieldInParent, model);

    this._valueFactory = valueFactory;
  }

  _detach(): void {
    this._detachChildren();
    super._detach();
  }

  dataAt(pathArgs: any): ConvergenceValue<any> {
    // We're letting them pass in individual path arguments or a single array of path arguments
    var pathArgsForReal: Path = Array.isArray(pathArgs) ? pathArgs : arguments;
    if (pathArgsForReal.length === 0) {
      throw new Error("relative path of child must contain at least one element.");
    }
    return this._path(pathArgsForReal);
  }

  abstract _path(pathArgs: Path): ConvergenceValue<any>;

  protected abstract _detachChildren(): void;
}
