/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "LICENSE" and
 * "LICENSE.LGPL" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {ModelCollaborator} from "../rt/ModelCollaborator";
import {RealTimeModel} from "../rt/RealTimeModel";
import {IModelEvent} from "./IModelEvent";

/**
 * Emitted when a remote user opens a model.  This is only emitted if the
 * current user has that particular model already open.
 *
 * @module Real Time Data
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
