//import {RealTimeValue} from "./RealTimeValue";
//
//
//
//export class RealTimeRichText extends RealTimeValue<RichTextDocument> {
//
//}
//
//export interface RichTextChangeSet {
//  changes: any[];
//}
//
//export class RichTextDocument {
//  blocks: RichTextBlock[];
//}
//
//export interface RichTextBlock {
//  type: String;
//}
//
//export interface RichTextParagraph extends RichTextBlock {
//  contents: RichTextInline[];
//}
//
//export interface RichTextInline {
//
//}
//
//export interface TextRegion extends RichTextInline {
//  type: string;
//  text: string;
//  style: {[key: string]: any};
//}
//
//
//var changeSet: any[] = [
//  {action: "insertText", pos: {block: 3, index: 4}, text: "foo"},
//  {action: "insertText", pos: {block: 3, index: 4}, text: "foo", attributes: {bold: true}},
//  {action: "insertBlock", index: 5, type: "text"},
//  {action: "insertBlock", index: 6, type: "text", contents: [{text: "foo", attributes: {bold: true}}]},
//
//  {action: "removeText", pos: {block: 3, index: 4}, length: 5},
//  {action: "removeBlock", index: 7},
//  {action: "removeBlock", index: 7, count: 3},
//
//  {action: "setAttributes", startPos: {block: 4, index: 2}, endPos: {block: 6, index: 7}, attributes: {bold: false}}
//];
