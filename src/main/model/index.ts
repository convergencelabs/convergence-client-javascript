/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "LICENSE" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

/**
 * When considering implementing real-time collaboration, most developers think
 * (and only think!) about the various algorithms for synchronizing data. This
 * indeed is a core consideration for collaborative editing systems, and
 * many tomes have been written about it.  Convergence's main goal is to insulate
 * developers from the difficulties of implementing Operational Transformation.
 * It does this by supporting a strict set of data: JSON.
 *
 * See our [developer guide](https://docs.convergence.io/guide/models/overview.html)
 * for additional information.
 *
 * To get started with Real Time Data, get an instance of the [[ModelService]]
 * from the [[ConvergenceDomain]].
 *
 * @moduledefinition Real Time Data
 */

export * from "./ModelService";
export * from "./Path";

export * from "./events";
export * from "./historical";
export * from "./query";
export * from "./reference";
export * from "./rt";

export * from "./dataValue";
export * from "./ModelPermissionManager";
export * from "./ModelPermissions";

export * from "./ICreateModelOptions";
export * from "./ModelDataInitializer";
export * from "./IAutoCreateModelOptions";
