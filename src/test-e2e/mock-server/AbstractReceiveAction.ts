import MockServerAction from "./MockServerAction";
import {TimeoutCallback} from "./MockConvergenceServer";
import {CompleteCallback} from "./MockConvergenceServer";
import {IDoneManager} from "./doneManager";
import {MessageType} from "../../main/ts/connection/protocol/MessageType";
import {EqualsUtil} from "../../main/ts/util/EqualsUtil";

abstract class AbstractReceiveAction extends MockServerAction {
  constructor(actionId: number,
              timeoutCallback: TimeoutCallback,
              completeCallback: CompleteCallback,
              messageGenerator: () => any,
              timeout?: number) {

    super(actionId, timeoutCallback, completeCallback, messageGenerator, timeout);
  }

  public abstract processMessage(envelope: any, doneManager: IDoneManager): boolean;

  protected _validateType(expected: any, actual: any, doneManager: IDoneManager): boolean {
    if (expected.t !== actual.t) {
      doneManager.testFailure(
        new Error(`Expected type '${MessageType[expected.t]}, but received '${MessageType[actual.t]}'.`));
      return false;
    }
    return true;
  }

  protected _validateBody(expected: any, actual: any, doneManager: IDoneManager): boolean {
    if (!EqualsUtil.deepEquals(expected, actual)) {
      doneManager.testFailure(new Error(
        `Expected body '${JSON.stringify(expected)}', but received '${JSON.stringify(actual)}'.`));
      return false;
    }
    return true;
  }
}

export default AbstractReceiveAction;
