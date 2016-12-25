import {ModelReference} from "./ModelReference";
import {RealTimeElement} from "../rt/RealTimeElement";
import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";
import {RealTimeModel} from "../rt/RealTimeModel";
import {ConvergenceEvent} from "../../util/ConvergenceEvent";

export interface ModelReferenceCallbacks {
  onPublish: (reference: LocalModelReference<any, any>) => void;
  onUnpublish: (reference: LocalModelReference<any, any>) => void;
  onSet: (reference: LocalModelReference<any, any>) => void;
  onClear: (reference: LocalModelReference<any, any>) => void;
}
export declare type ReferenceDisposedCallback = (reference: LocalModelReference<any, any>) => void;

export declare abstract class LocalModelReference<V, R extends ModelReference<V>>
  extends ConvergenceEventEmitter<ConvergenceEvent> {

  public type(): string;

  public key(): string;

  public source(): RealTimeElement<any> | RealTimeModel;

  public isLocal(): boolean;

  public username(): string;

  public sessionId(): string;

  public isDisposed(): boolean;

  public value(): V;
  public value(value: V): void;

  public values(): V[];
  public values(values: V[]): void;

  public reference(): R;

  public share(): void;

  public unshare(): void;

  public isShared(): boolean;

  public clear(): void;

  public dispose(): void;

  public isSet(): boolean;

  protected _fireSet(): void;

  private _ensureAttached();
}
