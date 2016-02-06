export default class MessageType {
  static ERROR: string = "error";
  static HANDSHAKE: string = "handshake";
  static AUTHENTICATE: string = "authenticate";

  static OPEN_REAL_TIME_MODEL: string = "openRealTimeModel";
  static CREATE_REAL_TIME_MODEL: string = "createRealTimeModel";
  static DELETE_REAL_TIME_MODEL: string = "deleteRealTimeModel";
  static CLOSE_REAL_TIME_MODEL: string = "closeRealTimeModel";
  static FORCE_CLOSE_REAL_TIME_MODEL: string = "forceCloseRealTimeModel";
}
