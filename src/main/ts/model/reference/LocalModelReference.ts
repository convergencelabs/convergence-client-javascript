import RealTimeValue from "../RealTimeValue";
import {ModelReference} from "./ModelReference";

export abstract class LocalModelReference {

  constructor(protected _reference: ModelReference,
              private _published: boolean) {
  }

  type(): string {
    return this._reference.type();
  }

  key(): string {
    return this._reference.key();
  }

  source(): RealTimeValue<any> {
    return this._reference.source();
  }

  userId(): string {
    return this._reference.userId();
  }

  sessionId(): string {
    return this._reference.sessionId();
  }

  isDisposed(): boolean {
    return this._reference.isDisposed();
  }

  publish(): void {
    this._published = true;
  }

  unpublish(): void {
    this._published = false;
  }

  isPublished(): boolean {
    return this._published;
  }

  abstract clear(): void;
}
