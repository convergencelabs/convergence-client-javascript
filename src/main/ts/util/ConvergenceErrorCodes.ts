import {Immutable} from "./Immutable";

/**
 * Some potential error codes in Convergence.
 */
export const ConvergenceErrorCodes = {
  AUTHENTICATION_FAILED: "authentication_failed",

  OFFLINE: "offline",

  CHAT_NOT_JOINED: "chat_not_joined"
};

Immutable.make(ConvergenceErrorCodes);
