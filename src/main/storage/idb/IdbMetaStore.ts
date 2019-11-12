/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {IdbPersistenceStore} from "./IdbPersistenceStore";
import {IDomainUserIdData, IMetaStore} from "../api";

export class IdbMetaStore extends IdbPersistenceStore implements IMetaStore {
  public getDomainUserId(): Promise<IDomainUserIdData> {
    return undefined;
  }
}
