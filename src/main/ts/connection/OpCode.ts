module convergence.connection {
  export class OpCode {
    static get PING(): string {
      return "ping";
    }

    static get PONG(): string {
      return "pong";
    }

    static get REQUEST(): string {
      return "rqst";
    }

    static get REPLY(): string {
      return "rply";
    }

    static get NORMAL(): string {
      return "nrml";
    }
  }
}
