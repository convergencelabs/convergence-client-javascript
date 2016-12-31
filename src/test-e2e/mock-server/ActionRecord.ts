import {IActionRecord} from "./records";
import MockServerAction from "./MockServerAction";

abstract class ActionRecord implements IActionRecord {

  private _message: any;

  constructor(protected _serverAction: MockServerAction) {
  }

  public actionId(): number {
    return this._serverAction.actionId();
  }

  public setMessage(message: any): void {
    this._message = message;
  }

  public message(): any {
    return this._message;
  }
}

export default ActionRecord;
