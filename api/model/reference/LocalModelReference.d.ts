import {ModelReference, ModelReferenceEvents} from "./ModelReference";
import {RealTimeElement} from "../rt/RealTimeElement";
import {RealTimeModel} from "../rt/RealTimeModel";
import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";
import {ConvergenceEvent} from "../../util/ConvergenceEvent";

export interface ModelReferenceCallbacks {
  onShare: (reference: LocalModelReference<any, any>) => void;
  onUnshare: (reference: LocalModelReference<any, any>) => void;
  onSet: (reference: LocalModelReference<any, any>) => void;
  onClear: (reference: LocalModelReference<any, any>) => void;
}

export declare abstract class LocalModelReference<V, R extends ModelReference<V>>
  extends ConvergenceEventEmitter<ConvergenceEvent> {

  public static readonly Events: ModelReferenceEvents;

  public type(): string;

  public key(): string;

  public source(): RealTimeElement<any> | RealTimeModel;

  public isLocal(): boolean;

  public username(): string;

  public sessionId(): string;

  public isDisposed(): boolean;

  public value(): V;

  public values(): V[];

  public reference(): R;

  public share(): void;

  public unshare(): void;

  public isShared(): boolean;

  public set(value: V): void;

  public set(value: V[]): void;

  public clear(): void;

  public isSet(): boolean;

  public dispose(): void;

  protected _fireSet(): void;

  private _ensureAttached();
}
