/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

/**
 * An object used to query for remote references.  See [[RealTimeModel.references]]
 *
 * @category Collaboration Awareness
 */
export interface ReferenceFilter {
  sessionId?: string;
  key?: string;
}
