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

import {NodeWrapperFactory} from "../internal/NodeWrapperFactory";
import {ModelNode} from "../internal/ModelNode";
import {ModelElementType} from "../ModelElementType";
import {ArrayNode} from "../internal/ArrayNode";
import {ObjectNode} from "../internal/ObjectNode";
import {BooleanNode} from "../internal/BooleanNode";
import {NullNode} from "../internal/NullNode";
import {NumberNode} from "../internal/NumberNode";
import {StringNode} from "../internal/StringNode";
import {UndefinedNode} from "../internal/UndefinedNode";
import {HistoricalElement} from "./HistoricalElement";
import {HistoricalArray} from "./HistoricalArray";
import {HistoricalObject} from "./HistoricalObject";
import {HistoricalBoolean} from "./HistoricalBoolean";
import {HistoricalNull} from "./HistoricalNull";
import {HistoricalNumber} from "./HistoricalNumber";
import {HistoricalString} from "./HistoricalString";
import {HistoricalUndefined} from "./HistoricalUndefined";
import {HistoricalModel} from "./HistoricalModel";
import {HistoricalDate} from "./HistoricalDate";
import {DateNode} from "../internal/DateNode";

/**
 * @hidden
 * @internal
 */
export class HistoricalWrapperFactory extends NodeWrapperFactory<HistoricalElement<any>> {

  constructor(private _model: HistoricalModel) {
    super();
  }

  protected _createWrapper(node: ModelNode<any>): HistoricalElement<any> {
    switch (node.type()) {
      case ModelElementType.ARRAY:
        return new HistoricalArray(node as ArrayNode, this, this._model);
      case ModelElementType.OBJECT:
        return new HistoricalObject(node as ObjectNode, this, this._model);
      case ModelElementType.BOOLEAN:
          return new HistoricalBoolean(node as BooleanNode, this, this._model);
      case ModelElementType.NULL:
        return new HistoricalNull(node as NullNode, this, this._model);
      case ModelElementType.NUMBER:
        return new HistoricalNumber(node as NumberNode, this, this._model);
      case ModelElementType.STRING:
        return new HistoricalString(node as StringNode, this, this._model);
      case ModelElementType.UNDEFINED:
        return new HistoricalUndefined(node as UndefinedNode, this, this._model);
      case ModelElementType.DATE:
        return new HistoricalDate(node as DateNode, this, this._model);
      default:
        return null;
      }
  }
}
