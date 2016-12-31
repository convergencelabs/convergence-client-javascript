import AbstractSendAction from "./AbstractSendAction";
import SendResponseRecord from "./SendResponseRecord";
import {TimeoutCallback} from "./MockConvergenceServer";
import {CompleteCallback} from "./MockConvergenceServer";
import {IReceiveRequestRecord} from "./records";
import {ISendResponseRecord} from "./records";

export default class SendResponseAction extends AbstractSendAction {

  private _record: SendResponseRecord;

  constructor(actionId: number,
              private _requestRecord: IReceiveRequestRecord,
              timeoutCallback: TimeoutCallback,
              completeCallback: CompleteCallback,
              private _sendCallback: (msg: any) => void,
              messageGenerator: () => any,
              timeout?: number) {
    super(actionId, timeoutCallback, completeCallback, messageGenerator, timeout);
    this._record = new SendResponseRecord(this);
  }

  public execute(): void {
    const message: any = this._messageGenerator();
    this._envelope = {
      p: this._requestRecord.requestId(),
      b: message
    };
    this._sendCallback(this._envelope);
    this._record.setMessage(message);
    this._record.setSent();
    super.execute();
  }

  public sendResponseRecord(): ISendResponseRecord {
    return this._record;
  }

  public requestRecord(): IReceiveRequestRecord {
    return this._requestRecord;
  }

  public responseId(): number {
    return this._requestRecord.requestId();
  }

  protected _generateTimeoutMessage(): string {
    return "Timeout exceeded waiting for a sent response to be acknowledged: " +
      JSON.stringify(this.sendResponseRecord().message());
  }
}
