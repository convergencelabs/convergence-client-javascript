import SendRecord from "./SendRecord";
import {ISendRequestRecord} from "./records";
import {SendRequestAction} from "./SendRequestAction";

export default class SendRequestRecord extends SendRecord implements ISendRequestRecord {
  constructor(serverAction: SendRequestAction) {
    super(serverAction);
  }

  public requestId(): number {
    return (<SendRequestAction> this._serverAction).requestId();
  }
}
