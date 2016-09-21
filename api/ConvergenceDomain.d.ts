import {ConvergenceEventEmitter} from "./util/ConvergenceEventEmitter";
import {ConvergenceOptions} from "./ConvergenceOptions";
import {Session} from "./Session";
import {ModelService} from "./model/ModelService";
import {ActivityService} from "./activity/ActivityService";
import {IdentityService} from "./identity/IdentityService";
import {PresenceService} from "./presence/PresenceService";
import {ChatService} from "./chat/ChatService";

export default class ConvergenceDomain extends ConvergenceEventEmitter {

  static Events: any;

  static connect(url: string, username: string, password: string, options?: ConvergenceOptions): Promise<ConvergenceDomain>;

  static connectWithToken(url: string, token: string, options?: ConvergenceOptions): Promise<ConvergenceDomain>;

  session(): Session;

  models(): ModelService;

  identity(): IdentityService;

  activities(): ActivityService;

  presence(): PresenceService;

  chat(): ChatService;

  dispose(): void;

  isDisposed(): boolean;

  // todo do we need an event stream here?  Change the event emitter?
}
