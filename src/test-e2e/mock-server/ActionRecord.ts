import {IActionRecord} from "./records";
import MockServerAction from "./MockServerAction";

abstract class ActionRecord implements IActionRecord {

  private _message: any;

  constructor(protected _serverAction: MockServerAction) {
  }

  actionId(): number {
    return this._serverAction.actionId();
  }

  setMessage(message: any): void {
    this._message = message;
  }

  message(): any {
    return this._message;
  }
}

export default ActionRecord;
