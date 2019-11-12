/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {ReferenceType} from "./ReferenceType";

/**
 * @hidden
 * @internal
 */
export class RemoteReferenceEvent {
  constructor(public readonly sessionId: string,
              public readonly resourceId: string,
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
              resourceId: string,
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
              resourceId: string,
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
              resourceId: string,
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
              resourceId: string,
              valueId: string,
              key: string) {
    super(sessionId, resourceId, valueId, key);
  }
}
