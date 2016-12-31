import ActionRecord from "./ActionRecord";
import {ISendRecord} from "./records";
import MockServerAction from "./MockServerAction";

export default class SendRecord extends ActionRecord implements ISendRecord {
  private _acked: boolean;
  private _sent: boolean;

  constructor(serverAction: MockServerAction) {
    super(serverAction);
    this._sent = false;
  }

  public acknowledgeReceipt(): void {
    this._acked = true;
    this._serverAction.complete();
  }

  public isAcknowledged(): boolean {
    return this._acked;
  }

  public isSent(): boolean {
    return this._sent;
  }

  public setSent(): void {
    this._sent = true;
  }
}
