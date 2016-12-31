import {ConvergenceEventEmitter} from "./util/ConvergenceEventEmitter";
import {ConvergenceEvent} from "./util/ConvergenceEvent";
import {Session} from "./Session";
import {ModelService} from "./model/ModelService";
import {ActivityService} from "./activity/ActivityService";
import {IdentityService} from "./identity/IdentityService";
import {PresenceService} from "./presence/PresenceService";
import {ChatService} from "./chat/ChatService";


export class ConvergenceDomain extends ConvergenceEventEmitter<ConvergenceEvent> {

  public static Events: any;

  public session(): Session;

  public models(): ModelService;

  public identity(): IdentityService;

  public activities(): ActivityService;

  public presence(): PresenceService;

  public chat(): ChatService;

  public dispose(): void;

  public isDisposed(): boolean;
}
