import ActionRecord from "./ActionRecord";
import {IReceiveRequestRecord} from "./records";
import MockServerAction from "./MockServerAction";
import ReceiveRequestAction from "./ReceiveRequestAction";

export default class ReceiveRequestRecord extends ActionRecord implements IReceiveRequestRecord {
  private _received: boolean;

  constructor(serverAction: MockServerAction) {
    super(serverAction);
    this._received = false;
  }

  public requestId(): number {
    return (<ReceiveRequestAction> this._serverAction).requestId();
  }

  public isReceived(): boolean {
    return this._received;
  }

  public setReceived(): void {
    this._received = true;
  }
}
