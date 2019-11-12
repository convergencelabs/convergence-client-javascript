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
