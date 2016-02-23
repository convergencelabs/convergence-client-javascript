import AbstractSendAction from "./AbstractSendAction";
import SendRequestRecord from "./SendRequestRecord";
import {TimeoutCallback} from "./MockConvergenceServer";
import {CompleteCallback} from "./MockConvergenceServer";
import {ISendRequestRecord} from "./records";

export class SendRequestAction extends AbstractSendAction {

  private _record: SendRequestRecord;

  constructor(actionId: number,
              private _reqId: number,
              timeoutCallback: TimeoutCallback,
              completeCallback: CompleteCallback,
              private _sendCallback: (msg: any) => void,
              messageGenerator: () => any,
              timeout?: number) {
    super(actionId, timeoutCallback, completeCallback, messageGenerator, timeout);
    this._record = new SendRequestRecord(this);
  }

  execute(): void {
    var message: any = this._messageGenerator();
    this._envelope = {
      q: this._reqId,
      b: message
    };
    this._sendCallback(this._envelope);
    this._record.setMessage(message);
    this._record.setSent();
    super.execute();
  }

  sendRequestRecord(): ISendRequestRecord {
    return this._record;
  }

  requestId(): number {
    return this._reqId;
  }

  protected _generateTimeoutMessage(): string {
    return "Timeout exceeded waiting for a sent request to be acknowledged: " + JSON.stringify(this.sendRequestRecord().message());
  }
}
