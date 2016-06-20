import ActionRecord from "./ActionRecord";
import {IReceiveRecord} from "./records";
import MockServerAction from "./MockServerAction";

export default class ReceiveRecord extends ActionRecord implements IReceiveRecord {
  private _received: boolean;

  constructor(serverAction: MockServerAction) {
    super(serverAction);
    this._received = false;
  }

  isReceived(): boolean {
    return this._received;
  }

  setReceived(): void {
    this._received = true;
  }
}