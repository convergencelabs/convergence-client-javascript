import {PathElement} from ".././ot/Path";
import {ModelOperationEvent} from ".././ModelOperationEvent";
import {ConvergenceValue} from "./ConvergenceValue";
import {ValueFactory} from "./ValueFactory";
import {ConvergenceModel} from "./ConvergenceModel";
import {ConvergenceContainerValue} from "./ConvergenceContainerValue";
import {ConvergenceValueType} from "./ConvergenceValueType";

export default class ConvergenceNull extends ConvergenceValue<any> {

  static Events: any = {
    DETACHED: ConvergenceValue.Events.DETACHED
  };

  /**
   * Constructs a new RealTimeNull.
   */
  constructor(id: string,
              parent: ConvergenceContainerValue<any>,
              fieldInParent: PathElement,
              valueFactory: ValueFactory,
              model: ConvergenceModel) {
    super(ConvergenceValueType.Null, id, parent, fieldInParent, model);
  }

  protected _getValue(): any {
    return null;
  }

  _handleRemoteOperation(operationEvent: ModelOperationEvent): void {
    throw new Error("Null values do not process operations");
  }
}
