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

/**
 * A PathElement is a particular desired node within a [[RealTimeModel]]'s contents,
 * which can be thought of as a JSON tree.
 *
 * These have no meaning outside of a [[Path]].
 *
 * @module Real Time Data
 */
export type PathElement = string | number;

/**
 * A `Path` is essentially a set of instructions for retrieving a particular piece of data
 * (subtree) within a model's contents (JSON tree). e.g.
 *
 * for a model with contents
 *
 * ```json
 * {
 *   "firstName": "James",
 *   "kidsAges": [4, 7, 9]
 * }
 * ```
 *
 * one could query:
 *
 * ```typescript
 * realTimeModel.elementAt(['firstName']) // RealTimeString, value() => "James"
 * realTimeModel.elementAt(['kidsAges', 1]) // RealTimeNumber, value() => 7
 * ```
 *
 * See the
 * [developer guide](https://docs.convergence.io/guide/models/overview.html#paths) for
 * more examples of using paths to get parts of a model's contents.
 *
 * @module Real Time Data
 */
export type Path = PathElement[];
