import {RealTimeElement} from "./RealTimeElement";
import {RealTimeContainerElement} from "./RealTimeContainerElement";
import {RealTimeValue} from "../../../src/main/ts/model/rt/RealTimeValue";


export declare class RealTimeArray extends RealTimeElement<any[]> implements RealTimeContainerElement<any[]> {

  static Events: any;

  get(index: number): RealTimeElement<any>;


  set(index: number, value: any): RealTimeElement<any>;

  insert(index: number, value: any): RealTimeElement<any>;

  remove(index: number): Object | number | string | boolean;

  reorder(fromIndex: number, toIndex: number): void;


  push(value: any): RealTimeElement<any>;

  pop(): any;

  unshift(value: any): RealTimeElement<any>;

  shift(): any;


  length(): number;


  some(callback: (element: RealTimeElement<any>, index: number) => boolean): boolean;

  every(callback: (element: RealTimeElement<any>, index: number) => boolean): boolean;

  find(callback: (element: RealTimeElement<any>, index: number) => boolean): RealTimeValue<any>

  findIndex(callback: (element: RealTimeElement<any>, index: number) => boolean): number;


  forEach(callback: (value: RealTimeElement<any>, index: number) => void): void;


  elementAt(pathArgs: any): RealTimeElement<any>;
}
