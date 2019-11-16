/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "LICENSE" and
 * "LICENSE.LGPL" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {Model} from "./Model";
import {ModelNode} from "./ModelNode";
import {UndefinedNode} from "./UndefinedNode";
import {NullNode} from "./NullNode";
import {StringNode} from "./StringNode";
import {ArrayNode} from "./ArrayNode";
import {
  DataValue,
  DateValue,
  ArrayValue,
  StringValue,
  ObjectValue,
  NumberValue,
  BooleanValue} from "../dataValue";
import {ObjectNode} from "./ObjectNode";
import {NumberNode} from "./NumberNode";
import {BooleanNode} from "./BooleanNode";
import {Path} from "../Path";
import {DataValueFactory} from "../DataValueFactory";
import {DateNode} from "./DateNode";
import {ConvergenceSession} from "../../ConvergenceSession";

/**
 * @hidden
 * @internal
 */
export class ModelNodeFactory {

  public static create(data: DataValue,
                       path: () => Path,
                       model: Model,
                       session: ConvergenceSession,
                       dataValueFactory?: DataValueFactory): ModelNode<any> {

    if (data === undefined) {
      return new UndefinedNode(undefined, path, session);
    }

    const type: string = data.type;
    if (type === "null") {
      return new NullNode(data.id, path, model, session);
    } else if (type === "string") {
      return new StringNode(data as StringValue, path, model, session);
    } else if (type === "array") {
      return new ArrayNode(data as ArrayValue, path, model, session, dataValueFactory);
    } else if (type === "object") {
      return new ObjectNode(data as ObjectValue, path, model, session, dataValueFactory);
    } else if (type === "number") {
      return new NumberNode(data as NumberValue, path, model, session);
    } else if (type === "boolean") {
      return new BooleanNode(data as BooleanValue, path, model, session);
    } else if (type === "date") {
      return new DateNode(data as DateValue, path, model, session);
    } else {
      throw new Error("Invalid data type: " + type);
    }
  }
}
