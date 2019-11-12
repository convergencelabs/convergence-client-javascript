/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {ObjectValue} from "../../model/dataValue";
import {ModelPermissions} from "../../model";

/**
 * @hidden
 * @internal
 */
export interface IModelData {
  modelId: string;
  local: boolean;
  collection: string;
  version: number;
  seqNo: number;
  createdTime: Date;
  modifiedTime: Date;
  permissions: ModelPermissions;
  data: ObjectValue;
}
