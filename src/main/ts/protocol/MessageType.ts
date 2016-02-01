module convergence.message {
  export class MessageType {
    static ERROR: string = "error";
    static HANDSHAKE: string = "handshake";
    static AUTH_PASSWORD: string = "authPassword";
    static AUTH_TOKEN: string = "authToken";
    static AUTH_RESPONSE: string = "authResponse";
  }
}
