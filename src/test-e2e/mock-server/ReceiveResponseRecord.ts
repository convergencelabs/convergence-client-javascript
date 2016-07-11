import ActionRecord from "./ActionRecord";
import {IReceiveResponseRecord} from "./records";
import MockServerAction from "./MockServerAction";
import {ISendRequestRecord} from "./records";
import ReceiveResponseAction from "./ReceiveResponseAction";

export class ReceiveResponseRecord extends ActionRecord implements IReceiveResponseRecord {
  private _received: boolean;

  constructor(serverAction: MockServerAction) {
    super(serverAction);
    this._received = false;
  }

  responseId(): number {
    return (<ReceiveResponseAction>this._serverAction).responseId();
  }

  requestRecord(): ISendRequestRecord {
    return (<ReceiveResponseAction>this._serverAction).sendRequestRecord();
  }

  isReceived(): boolean {
    return this._received;
  }

  setReceived(): void {
    this._received = true;
  }
}