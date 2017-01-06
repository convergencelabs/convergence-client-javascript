import {ConvergenceEvent} from "../util/ConvergenceEvent";
import {ActivityParticipant} from "./ActivityParticipant";
import {Activity} from "../../src/main/ts/activity/Activity";

export interface ActivityEvent extends ConvergenceEvent {
  readonly activity: Activity;
  readonly username: string;
  readonly sessionId: string;
  readonly local: boolean;
}

export declare class SessionJoinedEvent implements ActivityEvent {
  public readonly name: string;
  public readonly activity: Activity;
  public readonly username: string;
  public readonly sessionId: string;
  public readonly local: boolean;
  public readonly participant: ActivityParticipant;
}

export declare class SessionLeftEvent implements ActivityEvent {
  public readonly name: string;
  public readonly activity: Activity;
  public readonly username: string;
  public readonly sessionId: string;
  public readonly local: boolean;
}

export declare class StateSetEvent implements ActivityEvent {
  public readonly name: string;
  public readonly activity: Activity;
  public readonly username: string;
  public readonly sessionId: string;
  public readonly local: boolean;
  public readonly key: string;
  public readonly value: any;
}

export declare class StateClearedEvent implements ActivityEvent {
  public readonly name: string;
  public readonly activity: Activity;
  public readonly username: string;
  public readonly sessionId: string;
  public readonly local: boolean;
  public readonly key: string;
}
