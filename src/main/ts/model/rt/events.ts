import {IModelEvent} from "../events/IModelEvent";
import {ModelCollaborator} from "./ModelCollaborator";
import {RealTimeModel} from "./RealTimeModel";

export class CollaboratorOpenedEvent implements IModelEvent {
  public static readonly NAME = "collaborator_opened";
  public readonly name: string = CollaboratorOpenedEvent.NAME;

  constructor(public readonly src: RealTimeModel, public readonly collaborator: ModelCollaborator) {
    Object.freeze(this);
  }
}

export class CollaboratorClosedEvent implements IModelEvent {
  public static readonly NAME = "collaborator_closed";
  public readonly name: string = CollaboratorClosedEvent.NAME;

  constructor(public readonly src: RealTimeModel, public readonly collaborator: ModelCollaborator) {
    Object.freeze(this);
  }
}
