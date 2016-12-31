import {ISendResponseRecord} from "./records";
import SendResponseAction from "./SendResponseAction";
import {IReceiveRequestRecord} from "./records";
import SendRecord from "./SendRecord";

export default class SendResponseRecord extends SendRecord implements ISendResponseRecord {
  constructor(serverAction: SendResponseAction) {
    super(serverAction);
  }

  public responseId(): number {
    return (<SendResponseAction> this._serverAction).responseId();
  }

  public requestRecord(): IReceiveRequestRecord {
    return (<SendResponseAction> this._serverAction).requestRecord();
  }
}
