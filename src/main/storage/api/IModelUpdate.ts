/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

/**
 * @hidden
 * @internal
 */
import {ModelPermissions} from "../../model";
import {ObjectValue} from "../../model/dataValue";

export interface IModelUpdate {
  modelId: string;
  dataUpdate?: IModelDataUpdate;
  permissionsUpdate?: ModelPermissions;
}

export interface IModelDataUpdate {
  data: ObjectValue;
  version: number;
  createdTime: Date;
  modifiedTime: Date;
}
