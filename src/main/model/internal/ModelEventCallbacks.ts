import {DiscreteOperation} from "../ot/ops/DiscreteOperation";
import { ModelReferenceCallbacks} from "../reference";

/**
 * @hidden
 * @internal
 */
export interface ModelEventCallbacks {
  sendOperationCallback: (operation: DiscreteOperation) => void;
  referenceEventCallbacks: ModelReferenceCallbacks;
}
