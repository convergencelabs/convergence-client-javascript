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
 * A callback function that will result in some model data that will become the
 * model's initial contents.
 *
 * @module Real Time Data
 */
export type ModelDataCallback = () => ModelData;

/**
 * Some JSON-like model data that will become the new model's initial contents.
 *
 * @module Real Time Data
 */
export interface ModelData {
  [key: string]: any;
}

/**
 * Either some data or a callback returning data can be provided.
 *
 * @module Real Time Data
 */
export type ModelDataInitializer = ModelData | ModelDataCallback;
