import {ConvergenceEventEmitter} from "./util/ConvergenceEventEmitter";
import {ConvergenceOptions} from "./ConvergenceOptions";
import {Session} from "./Session";
import {ModelService} from "./model/ModelService";
import {ActivityService} from "./activity/ActivityService";
import {IdentityService} from "./identity/IdentityService";
import {PresenceService} from "./presence/PresenceService";
import {ChatService} from "./chat/ChatService";
import {ConvergenceEventEmitter} from "./util/ConvergenceEventEmitter";

export default class ConvergenceDomain extends ConvergenceEventEmitter {

  static Events: any;

  static connect(url: string, username: string, password: string, options?: ConvergenceOptions): Promise<ConvergenceDomain>;

  static connectWithJwt(url: string, jwt: string, options?: ConvergenceOptions): Promise<ConvergenceDomain>;

  static connectAnonymously(url: string, displayName?: string, options?: ConvergenceOptions): Promise<ConvergenceDomain>;

  session(): Session;

  models(): ModelService;

  identity(): IdentityService;

  activities(): ActivityService;

  presence(): PresenceService;

  chat(): ChatService;

  dispose(): void;

  isDisposed(): boolean;
}
