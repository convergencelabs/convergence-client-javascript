import AbstractReceiveAction from "./AbstractReceiveAction";
import {TimeoutCallback} from "./MockConvergenceServer";
import {CompleteCallback} from "./MockConvergenceServer";
import {IDoneManager} from "./doneManager";
import MessageType from "../../main/ts/connection/protocol/MessageType";
import EqualsUtil from "../../main/ts/util/EqualsUtil";
import ReceiveRequestRecord from "./ReceiveRequestRecord";

export default class ReceiveRequestAction extends AbstractReceiveAction {
  private _record: ReceiveRequestRecord;
  private _reqId: number;

  constructor(actionId: number,
              timeoutCallback: TimeoutCallback,
              completeCallback: CompleteCallback,
              messageGenerator: () => any,
              timeout?: number) {
    super(actionId, timeoutCallback, completeCallback, messageGenerator, timeout);
    this._record = new ReceiveRequestRecord(this);
  }

  requestRecord(): ReceiveRequestRecord {
    return this._record;
  }

  requestId(): number {
    return this._reqId;
  }

  processMessage(envelope: any, doneManager: IDoneManager): boolean {
    var body: any = this._messageGenerator();

    if (envelope.q === undefined) {
      doneManager.testFailure(new Error("A request message must have a requestId set."));
    } else if (envelope.p !== undefined) {
      doneManager.testFailure(new Error("A request message must not have a responseId set."));
    } else if (this._validateType(body, envelope.b, doneManager) &&  this._validateType(body, envelope.b, doneManager)) {
      this._reqId = envelope.q;
      this._record.setMessage(envelope.b);
      this._record.setReceived();
      this.complete();
      return true;
    }

    return false;
  }

  protected _generateTimeoutMessage(): string {
    return "Timeout exceeded waiting for a request to be received: " + JSON.stringify(this.requestRecord().message());
  }
}
