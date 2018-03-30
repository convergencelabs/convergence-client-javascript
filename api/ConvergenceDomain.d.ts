import {ConvergenceEventEmitter} from "./util/ConvergenceEventEmitter";
import {ConvergenceEvent} from "./util/ConvergenceEvent";
import {Session} from "./Session";
import {ModelService} from "./model/ModelService";
import {ActivityService} from "./activity/ActivityService";
import {IdentityService} from "./identity/IdentityService";
import {PresenceService} from "./presence/PresenceService";
import {ChatService} from "./chat/ChatService";
import {ConvergenceDomainEvent} from "./events";

export declare interface ConvergenceDomainEvents {
  readonly CONNECTED: string;
  readonly INTERRUPTED: string;
  readonly RECONNECTED: string;
  readonly DISCONNECTED: string;
  readonly ERROR: string;
}

export class ConvergenceDomain extends ConvergenceEventEmitter<ConvergenceDomainEvent> {

  public static readonly Events: ConvergenceDomainEvents;

  public session(): Session;

  public models(): ModelService;

  public identity(): IdentityService;

  public activities(): ActivityService;

  public presence(): PresenceService;

  public chat(): ChatService;

  public dispose(): void;

  public isDisposed(): boolean;

  public getReconnectToken(): Promise<string>;
}
