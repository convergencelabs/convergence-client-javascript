/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "COPYING" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {ConvergenceConnection} from "../connection/ConvergenceConnection";

import {com} from "@convergence/convergence-proto";
import {ChatPermission} from "./ChatPermission";
import {AbstractPermissionManager} from "../permissions/AbstractPermissionsManager";
import IPermissionTarget = com.convergencelabs.convergence.proto.core.IPermissionTarget;


/**
 * Allows getting and setting permissions for the various capabilities of [[Chat]]s.
 * The specific permissions are defined in [[ChatPermission]].  Permissions can be
 * assigned per-[[DomainUser]], per-[[UserGroup]], or for everybody
 * ([[setWorldPermissions]]).
 *
 * Generally speaking, more specific permissions override less-specific ones.  So a
 * user's explicit permission would override the group's permission which the user
 * is in, which would itself override any world permission for this `Chat`.
 *
 * @module Chat
 */
export class ChatPermissionManager extends AbstractPermissionManager<ChatPermission> {

  private readonly _target: IPermissionTarget;

  constructor(id: string, connection: ConvergenceConnection) {
    super(connection);
    this._target = {
      chat: {id}
    };
  }

  /**
   * @returns The id of the chat this permissions manager manages
   * permissions for.
   */
  public id(): string {
    return this._target.activity.id;
  }

  /**
   * @hidden
   * @internal
   */
  protected _getTarget(): IPermissionTarget {
    return this._target;
  }
}
