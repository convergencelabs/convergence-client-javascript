export interface AppliedOperation  {
  type: string;
  inverse(): AppliedOperation;
}
