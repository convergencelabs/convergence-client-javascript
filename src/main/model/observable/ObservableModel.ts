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

import {ConvergenceSession} from "../../ConvergenceSession";
import {ObservableObject} from "./ObservableObject";
import {ObservableElement} from "./ObservableElement";

/**
 * The events that could be emitted by a [[RealTimeModel]] or [[HistoricalModel]].
 *
 * @module Real Time Data
 */
export interface ObservableModelEvents {
  /**
   * Emitted when a model is closed locally. The actual event emitted is a [[ModelClosedEvent]].
   *
   * @event
   */
  readonly CLOSED: string;

  /**
   * Emitted when a model is deleted. The actual event emitted is a [[ModelDeletedEvent]].
   *
   * @event
   */
  readonly DELETED: string;

  /**
   * Emitted when the version of this model changes.  This could happen from
   * a local or remote change to this model. The actual emitted event is a [[VersionChangedEvent]].
   *
   * @event
   */
  readonly VERSION_CHANGED: string;
}

/**
 * @module Real Time Data
 */
export const ObservableModelEventConstants: ObservableModelEvents = {
  CLOSED: "closed",
  DELETED: "deleted",
  VERSION_CHANGED: "version_changed"
};
Object.freeze(ObservableModelEventConstants);

/**
 * @module Real Time Data
 */
export interface ObservableModel {

  session(): ConvergenceSession;

  collectionId(): string;

  modelId(): string;

  time(): Date;

  minTime(): Date;

  maxTime(): Date;

  createdTime(): Date;

  version(): number;

  minVersion(): number;

  maxVersion(): number;

  root(): ObservableObject;

  elementAt(path: any): ObservableElement<any>;
}
