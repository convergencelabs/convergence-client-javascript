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

import {DataValue} from "../../dataValue";

/**
 * @hidden
 * @internal
 */
export interface Change {
  type: string;
}

/**
 * @hidden
 * @internal
 */
export interface DiscreteChange extends Change {
  id: string;
}

/**
 * @hidden
 * @internal
 */
export interface BatchChange extends Change {
  ops: DiscreteChange[];
}

/**
 * @hidden
 * @internal
 */
export interface ArrayInsert extends DiscreteChange {
  index: number;
  value: DataValue;
}

/**
 * @hidden
 * @internal
 */
export interface ArrayMove extends DiscreteChange {
  fromIndex: number;
  toIndex: number;
}

/**
 * @hidden
 * @internal
 */
export interface ArrayRemove extends DiscreteChange {
  index: number;
}

/**
 * @hidden
 * @internal
 */
export interface ArrayReplace extends DiscreteChange {
  index: number;
  value: DataValue;
}

/**
 * @hidden
 * @internal
 */
export interface ArraySet extends DiscreteChange {
  value: DataValue[];
}

/**
 * @hidden
 * @internal
 */
export interface BooleanSet extends DiscreteChange {
  value: boolean;
}

/**
 * @hidden
 * @internal
 */
export interface NumberDelta extends DiscreteChange {
  delta: number;
}

/**
 * @hidden
 * @internal
 */
export interface NumberSet extends DiscreteChange {
  value: number;
}

/**
 * @hidden
 * @internal
 */
export interface ObjectAddProperty extends DiscreteChange {
  prop: string;
  value: DataValue;
}

/**
 * @hidden
 * @internal
 */
export interface ObjectRemoveProperty extends DiscreteChange {
  prop: string;
}

/**
 * @hidden
 * @internal
 */
export interface ObjectSetProperty extends DiscreteChange {
  prop: string;
  value: DataValue;
}

/**
 * @hidden
 * @internal
 */
export interface ObjectSet extends DiscreteChange {
  value: {[key: string]: DataValue};
}

/**
 * @hidden
 * @internal
 */
export interface StringInsert extends DiscreteChange {
  index: number;
  value: string;
}

/**
 * @hidden
 * @internal
 */
export interface StringRemove extends DiscreteChange {
  index: number;
  value: string;
}

/**
 * @hidden
 * @internal
 */
export interface StringSet extends DiscreteChange {
  noOp: boolean;
  value: string;
}

/**
 * @hidden
 * @internal
 */
export interface DateSet extends DiscreteChange {
  noOp: boolean;
  value: Date;
}
