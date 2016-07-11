import MockServerAction from "./MockServerAction";
import {TimeoutCallback} from "./MockConvergenceServer";
import {CompleteCallback} from "./MockConvergenceServer";

abstract class AbstractSendAction extends MockServerAction {
  constructor(actionId: number,
              timeoutCallback: TimeoutCallback,
              completeCallback: CompleteCallback,
              messageGenerator: () => any,
              timeout?: number) {

    super(actionId, timeoutCallback, completeCallback, messageGenerator, timeout);
  }
}

export default AbstractSendAction;