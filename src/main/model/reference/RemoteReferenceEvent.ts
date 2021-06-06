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

import {ReferenceType} from "./ReferenceType";

/**
 * @hidden
 * @internal
 */
export class RemoteReferenceEvent {
  constructor(public readonly sessionId: string,
              public readonly resourceId: number,
              public readonly valueId: string | null,
              public readonly key: string) {
  }
}

/**
 * @hidden
 * @internal
 */
export class RemoteReferenceShared extends RemoteReferenceEvent {
  constructor(sessionId: string,
              resourceId: number,
              valueId: string | null,
              key: string,
              public readonly referenceType: ReferenceType,
              public readonly values?: any[]) {
    super(sessionId, resourceId, valueId, key);
  }
}

/**
 * @hidden
 * @internal
 */
export class RemoteReferenceUnshared extends RemoteReferenceEvent {
  constructor(sessionId: string,
              resourceId: number,
              valueId: string | null,
              key: string) {
    super(sessionId, resourceId, valueId, key);
  }
}

/**
 * @hidden
 * @internal
 */
export class RemoteReferenceSet extends RemoteReferenceEvent {
  constructor(sessionId: string,
              resourceId: number,
              valueId: string | null,
              key: string,
              public readonly values: any[]) {
    super(sessionId, resourceId, valueId, key);
  }
}

/**
 * @hidden
 * @internal
 */
export class RemoteReferenceCleared extends RemoteReferenceEvent {
  constructor(sessionId: string,
              resourceId: number,
              valueId: string,
              key: string) {
    super(sessionId, resourceId, valueId, key);
  }
}
