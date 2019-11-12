/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {ModelCollaborator} from "../rt/ModelCollaborator";
import {RealTimeModel} from "../rt/RealTimeModel";
import {IModelEvent} from "./IModelEvent";

/**
 * Emitted when a remote user opens a model.  This is only emitted if the
 * current user has that particular model already open.
 *
 * @category Real Time Data Subsystem
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
