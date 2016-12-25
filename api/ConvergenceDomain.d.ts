import {ConvergenceEventEmitter} from "./util/ConvergenceEventEmitter";
import {Session} from "./Session";
import {ModelService} from "./model/ModelService";
import {ActivityService} from "./activity/ActivityService";
import {IdentityService} from "./identity/IdentityService";
import {PresenceService} from "./presence/PresenceService";
import {ChatService} from "./chat/ChatService";


export default class ConvergenceDomain extends ConvergenceEventEmitter {

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
