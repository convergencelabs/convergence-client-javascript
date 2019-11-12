/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {IdbSchemaVersion1} from "./IdbSchemaVersion1";

/**
 * @hidden
 * @internal
 */
export class IdbSchemaManager {
  public static upgrade(db: IDBDatabase, targetVersion: number) {
    switch (targetVersion) {
      case 1:
        IdbSchemaVersion1.upgrade(db);
      default:
        // no-op
    }
  }
}
