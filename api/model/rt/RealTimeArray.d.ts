import {RealTimeValue} from "./RealTimeValue";
import {RealTimeContainerValue} from "./RealTimeContainerValue";


export declare class RealTimeArray extends RealTimeValue<any[]> implements RealTimeContainerValue<any[]> {

  static Events: any;

  get(index: number): RealTimeValue<any>;

  set(index: number, value: any): RealTimeValue<any>;

  insert(index: number, value: any): RealTimeValue<any>;

  remove(index: number): Object | number | string | boolean;

  reorder(fromIndex: number, toIndex: number): void;

  push(value: any): RealTimeValue<any>;

  pop(): any;

  unshift(value: any): RealTimeValue<any>;

  shift(): any;

  length(): number;

  forEach(callback: (value: RealTimeValue<any>, index?: number) => void): void;

  elementAt(pathArgs: any): RealTimeValue<any>;
}
