import {ModelCollaborator} from "../rt/ModelCollaborator";
import {RealTimeModel} from "../rt/RealTimeModel";
import {IModelEvent} from "./IModelEvent";

/**
 * Emitted when a remote user opens a model.  This is only emitted if the
 * current user has that particular model already open.
 *
 * @module RealTimeData
 */
export class CollaboratorOpenedEvent implements IModelEvent {
  public static readonly NAME = "collaborator_opened";

  /**
   * @inheritdoc
   */
  public readonly name: string = CollaboratorOpenedEvent.NAME;

  constructor(
    /**
     * The model that was opened.
     */
    public readonly src: RealTimeModel,

    /**
     * The [[DomainUser]] / session ID of the remote collaborator.
     */
    public readonly collaborator: ModelCollaborator
  ) {
    Object.freeze(this);
  }
}
