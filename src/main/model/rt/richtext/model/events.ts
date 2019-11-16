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

/**
 * @hidden
 * @internal
 */
export interface RichTextEvent {
}

/**
 * @hidden
 * @internal
 */
export interface RichTextNodeEvent extends RichTextEvent {
  readonly node: RichTextNode;
}

/**
 * @hidden
 * @internal
 */
export interface RichTextNodeAttributesSet extends RichTextNodeEvent {
  attributes: Map<string, any>;
}

/**
 * @hidden
 * @internal
 */
export interface RichTextNodeAttributesRemoved extends RichTextNodeEvent {
  attributes: string[];
}

/**
 * @hidden
 * @internal
 */
export interface RichTextElementEvent extends RichTextNodeEvent {
  readonly element: RichTextElement;
}

/**
 * @hidden
 * @internal
 */
export interface RichTextNodeInsertedEvent extends RichTextElementEvent {

}

/**
 * @hidden
 * @internal
 */
export interface RichTextRemovedEvent extends RichTextElementEvent {

}

/**
 * @hidden
 * @internal
 */
export interface RichTextElementNameChangedEvent extends RichTextElementEvent {
  oldName: string;
  newName: string;
}

// Text Node Operations
/**
 * @hidden
 * @internal
 */
export interface RichTextStringNodeEvent extends RichTextNodeEvent {
  string: RichTextString;
}

/**
 * @hidden
 * @internal
 */
export interface RichTextStringNodeInsertEvent extends RichTextStringNodeEvent {
  offset: number;
  text: string;
}

/**
 * @hidden
 * @internal
 */
export interface RichTextStringNodeRemoveEvent extends RichTextStringNodeEvent {
  offset: number;
  text: string;
}

// Document Level Operations
/**
 * @hidden
 * @internal
 */
export interface DocumentOperation extends RichTextEvent {

}

/**
 * @hidden
 * @internal
 */
export interface RichTextSetAttributesEvent extends DocumentOperation {
  range: RichTextRange;
  attributes: Map<string, any>;
}

/**
 * @hidden
 * @internal
 */
export interface RichTextRemoveAttributesEvent extends DocumentOperation {
  range: RichTextRange;
  attributes: string[];
}

/**
 * @hidden
 * @internal
 */
export interface RichTextStringInsertEvent extends DocumentOperation {
  location: RichTextLocation;
  text: string;
}

/**
 * @hidden
 * @internal
 */
export interface RichTextStringRemoveEvent extends DocumentOperation {
  location: RichTextLocation;
  length: number;
}

import {RichTextString} from "./RichTextString";
import {RichTextRange} from "./RichTextRange";
import {RichTextLocation} from "./RichTextLocation";
import {RichTextNode} from "./RichTextNode";
import {RichTextElement} from "./RichTextElement";
