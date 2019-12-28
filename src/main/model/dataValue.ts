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
 * Represents a value in a real time model.
 *
 * @module Real Time Data
 */
export interface IDataValue {
  /**
   * The unique identifier of this object within the model.
   */
  id: string;

  /**
   * The type of this data value.
   */
  type: "object" | "array" | "string" | "number" | "boolean" | "null" | "date";

  /**
   * The underlying value of this element of the model.
   */
  value: any;
}

/**
 * Represents a null value within a RealTimeModel.
 *
 * @module Real Time Data
 */
export interface INullValue extends IDataValue {
  /**
   * @inheritdoc
   */
  type: "null";

  /**
   * @inheritdoc
   */
  value: null;
}

/**
 * Represents a string value within a RealTimeModel.
 *
 * @module Real Time Data
 */
export interface IStringValue extends IDataValue {
  /**
   * @inheritdoc
   */
  type: "string";

  /**
   * @inheritdoc
   */
  value: string;
}

/**
 * Represents a number value within a RealTimeModel.
 *
 * @module Real Time Data
 */
export interface INumberValue extends IDataValue {
  /**
   * @inheritdoc
   */
  type: "number";

  /**
   * @inheritdoc
   */
  value: number;
}

/**
 * Represents a boolean value within a RealTimeModel.
 *
 * @module Real Time Data
 */
export interface IBooleanValue extends IDataValue {
  /**
   * @inheritdoc
   */
  type: "boolean";

  /**
   * @inheritdoc
   */
  value: boolean;
}

/**
 * Represents a object value within a RealTimeModel.
 *
 * @module Real Time Data
 */
export interface IObjectValue extends IDataValue {
  /**
   * @inheritdoc
   */
  type: "object";

  /**
   * @inheritdoc
   */
  value: { [key: string]: IDataValue };
}

/**
 * Represents a array value within a RealTimeModel.
 *
 * @module Real Time Data
 */
export interface IArrayValue extends IDataValue {
  /**
   * @inheritdoc
   */
  type: "array";

  /**
   * @inheritdoc
   */
  value: IDataValue[];
}

/**
 * Represents a date value within a RealTimeModel.
 *
 * @module Real Time Data
 */
export interface IDateValue extends IDataValue {

  /**
   * @inheritdoc
   */
  type: "date";

  /**
   * @inheritdoc
   */
  value: Date;
}
