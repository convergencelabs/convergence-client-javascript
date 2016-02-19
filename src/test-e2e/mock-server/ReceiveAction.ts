import AbstractReceiveAction from "./AbstractReceiveAction";
import {IDoneManager} from "./doneManager";
import {CompleteCallback} from "./MockConvergenceServer";
import {TimeoutCallback} from "./MockConvergenceServer";
import ReceiveRecord from "./ReceiveRecord";

export default class ReceiveAction extends AbstractReceiveAction {
  private _record: ReceiveRecord;

  constructor(actionId: number,
              timeoutCallback: TimeoutCallback,
              completeCallback: CompleteCallback,
              messageGenerator: () => any,
              timeout?: number) {
    super(actionId, timeoutCallback, completeCallback, messageGenerator, timeout);
    this._record = new ReceiveRecord(this);
  }

  record(): ReceiveRecord {
    return this._record;
  }

  processMessage(envelope: any, doneManager: IDoneManager): boolean {
    var body: any = this._messageGenerator();
    if (envelope.q !== undefined) {
      doneManager.testFailure(new Error("A normal message must not have a requestId set."));
    } else if (envelope.p !== undefined) {
      doneManager.testFailure(new Error("A response message must not have a responseId set."));
    } else if (this._validateType(body, envelope.b, doneManager) &&  this._validateBody(body, envelope.b, doneManager)) {
      this._record.setMessage(envelope.b);
      this._record.setReceived();
      this.complete();
      return true;
    }
    return false;
  }

  protected _generateTimeoutMessage(): string {
    return "Timeout exceeded waiting for a message to be received: " + JSON.stringify(this.record().message());
  }
}
