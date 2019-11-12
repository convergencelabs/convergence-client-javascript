/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {ICreateModelOptions} from "./ICreateModelOptions";

/**
 * The configuration that is available when creating a model using the
 * [[ModelService.openAutoCreate]] method.
 *
 * @category Real Time Data Subsystem
 */
export interface IAutoCreateModelOptions extends ICreateModelOptions {
  ephemeral?: boolean;
}
