import AbstractSendAction from "./AbstractSendAction";
import {TimeoutCallback} from "./MockConvergenceServer";
import {CompleteCallback} from "./MockConvergenceServer";
import SendRecord from "./SendRecord";
import {ISendRecord} from "./records";
export default class SendAction extends AbstractSendAction {

  private _record: SendRecord;

  constructor(actionId: number,
              timeoutCallback: TimeoutCallback,
              completeCallback: CompleteCallback,
              private _sendCallback: (msg: any) => void,
              messageGenerator: () => any,
              timeout?: number) {
    super(actionId, timeoutCallback, completeCallback, messageGenerator, timeout);
    this._record = new SendRecord(this);
  }

  public execute(): void {
    const message: any = this._messageGenerator();
    this._envelope = {
      b: message
    };
    this._sendCallback(this._envelope);
    this._record.setMessage(message);
    this._record.setSent();
    super.execute();
  }

  public sendRecord(): ISendRecord {
    return this._record;
  }

  protected _generateTimeoutMessage(): string {
    return "Timeout exceeded waiting for a sent message to be acknowledged: " +
      JSON.stringify(this.sendRecord().message());
  }
}
