import {TimeoutCallback} from "./MockConvergenceServer";
import {CompleteCallback} from "./MockConvergenceServer";
import {IDoneManager} from "./doneManager";
import AbstractReceiveAction from "./AbstractReceiveAction";
import {ReceiveResponseRecord} from "./ReceiveResponseRecord";
import {ISendRequestRecord} from "./records";
import {IReceiveResponseRecord} from "./records";

export default class ReceiveResponseAction extends AbstractReceiveAction {
  private _record: ReceiveResponseRecord;
  private _responseId: number;

  constructor(actionId: number,
              private _requestRecord: ISendRequestRecord,
              timeoutCallback: TimeoutCallback,
              completeCallback: CompleteCallback,
              messageGenerator: () => any,
              timeout?: number) {
    super(actionId, timeoutCallback, completeCallback, messageGenerator, timeout);
    this._record = new ReceiveResponseRecord(this);
  }

  responseRecord(): IReceiveResponseRecord {
    return this._record;
  }

  sendRequestRecord(): ISendRequestRecord {
    return this._requestRecord;
  }

  responseId(): number {
    return this._responseId;
  }

  processMessage(envelope: any, doneManager: IDoneManager): boolean {
    var body: any = this._messageGenerator();

    if (envelope.p === undefined) {
      doneManager.testFailure(new Error("A response message must have a responseId set."));
    } else if (envelope.q !== undefined) {
      doneManager.testFailure(new Error("A response message must not have a requestId set."));
    } else if (this._validateType(body, envelope.b, doneManager) &&  this._validateType(body, envelope.b, doneManager)) {
      this._responseId = envelope.p;
      this._record.setMessage(envelope.b);
      this._record.setReceived();
      this.complete();
      return true;
    }
    return false;
  }

  protected _generateTimeoutMessage(): string {
    return "Timeout exceeded waiting for a response to be received: " + JSON.stringify(this.responseRecord().message());
  }
}
