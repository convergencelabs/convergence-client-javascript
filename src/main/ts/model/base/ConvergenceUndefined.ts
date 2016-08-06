import {PathElement} from ".././ot/Path";
import {ModelOperationEvent} from ".././ModelOperationEvent";
import {ConvergenceContainerValue} from "./ConvergenceContainerValue";
import {ConvergenceValue} from "./ConvergenceValue";
import {ConvergenceModel} from "./ConvergenceModel";
import {ConvergenceValueType} from "./ConvergenceValueType";


export default class ConvergenceUndefined extends ConvergenceValue<void> {

  static Events: any = {
    DETACHED: ConvergenceValue.Events.DETACHED
  };

  /**
   * Constructs a new RealTimeUndefined.
   */
  constructor(id: string,
              parent: ConvergenceContainerValue<any>,
              fieldInParent: PathElement,
              model: ConvergenceModel) {
    super(ConvergenceValueType.Undefined, id, parent, fieldInParent, model);
  }

  protected _getValue(): void {
    return undefined;
  }

  _handleRemoteOperation(operationEvent: ModelOperationEvent): void {
    throw new Error("Undefined values do not process operations");
  }
}
