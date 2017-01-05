declare const CONVERGENCE_DEBUG: any;

export interface DebugFlags {
  SOCKET_MESSAGES: boolean;
  SOCKET_CONNECTION: boolean;

  PROTOCOL_EVENTS: boolean;
  PROTOCOL_MESSAGES: boolean;
  PROTOCOL_PINGS: boolean;

  CONNECTION: boolean;
}

const flags: DebugFlags = {
  SOCKET_MESSAGES: false,
  SOCKET_CONNECTION: false,

  PROTOCOL_EVENTS: false,
  PROTOCOL_MESSAGES: false,
  PROTOCOL_PINGS: false,

  CONNECTION: false
};

if (typeof CONVERGENCE_DEBUG === "object") {
  Object.assign(flags, CONVERGENCE_DEBUG);
}

export const debugFlags: DebugFlags = flags;
