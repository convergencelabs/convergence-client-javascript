export interface RichTextEvent {
}

export interface RichTextNodeEvent extends RichTextEvent {
  readonly node: RichTextNode;
}

export interface RichTextNodeAttributesSet extends RichTextNodeEvent {
  attributes: Map<string, any>;
}

export interface RichTextNodeAttributesRemoved extends RichTextNodeEvent {
  attributes: string[];
}

export interface RichTextElementEvent extends RichTextNodeEvent {
  readonly element: RichTextElement;
}

export interface RichTextNodeInsertedEvent extends RichTextElementEvent {

}

export interface RichTextRemovedEvent extends RichTextElementEvent {

}

export interface RichTextElementNameChangedEvent extends RichTextElementEvent {
  oldName: string;
  newName: string;
}

// Text Node Operations
export interface RichTextStringNodeEvent extends RichTextNodeEvent {
  string: RichTextString;
}

export interface RichTextStringNodeInsertEvent extends RichTextStringNodeEvent {
  offset: number;
  text: string;
}

export interface RichTextStringNodeRemoveEvent extends RichTextStringNodeEvent {
  offset: number;
  text: string;
}

// Document Level Operations
export interface DocumentOperation extends RichTextEvent {

}

export interface RichTextSetAttributesEvent extends DocumentOperation {
  range: RichTextRange;
  attributes: Map<string, any>;
}

export interface RichTextRemoveAttributesEvent extends DocumentOperation {
  range: RichTextRange;
  attributes: string[];
}

export interface RichTextStringInsertEvent extends DocumentOperation {
  location: RichTextLocation;
  text: string;
}

export interface RichTextStringRemoveEvent extends DocumentOperation {
  location: RichTextLocation;
  length: number;
}

import {RichTextString} from "./RichTextString";
import {RichTextRange} from "./RichTextRange";
import {RichTextLocation} from "./RichTextLocation";
import {RichTextNode} from "./RichTextNode";
import {RichTextElement} from "./RichTextElement";
