import {ModelEvent} from "../modelEvents";
import {ModelCollaborator} from "./ModelCollaborator";
import {RealTimeModel} from "./RealTimeModel";

export declare class CollaboratorOpenedEvent implements ModelEvent {
  public static readonly NAME: string;
  public readonly name: string;
  public readonly src: RealTimeModel;
  public readonly collaborator: ModelCollaborator;
}

export declare class CollaboratorClosedEvent implements ModelEvent {
  public static readonly NAME: string;
  public readonly name: string;
  public readonly src: RealTimeModel;
  public readonly collaborator: ModelCollaborator;
}
