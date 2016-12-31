export interface IActionRecord {
  actionId(): number;
  message(): any;
}

export interface ISendRecord extends IActionRecord {
  isSent(): boolean;
  acknowledgeReceipt(): void;
  isAcknowledged(): boolean;
}

export interface ISendRequestRecord extends ISendRecord {
  requestId(): number;
}

export interface ISendResponseRecord extends ISendRecord {
  responseId(): number;
  requestRecord(): IReceiveRequestRecord;
}

export interface IReceiveRecord extends IActionRecord {
  isReceived(): boolean;
}

export interface IReceiveRequestRecord extends IReceiveRecord {
  requestId(): number;
}

export interface IReceiveResponseRecord extends IReceiveRecord {
  responseId(): number;
  requestRecord(): ISendRequestRecord;
}
