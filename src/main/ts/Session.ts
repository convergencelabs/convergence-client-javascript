import ConvergenceDomain from "./ConvergenceDomain";

export interface Session {
  /**
   * @return The ConvergenceDomain for this session
   */
  getConvergenceDomain(): ConvergenceDomain;

  /**
   * @return The sessionId of the connected client
   */
  sessionId(): string;

  /**
   * @return The username of the authenticated client or null if not authenticated
   */
  username(): string;

  /**
   * @return True if the client is connected to the domain
   */
  isConnected(): boolean;

  /**
   * @return True if the client is authenticated
   */
  isAuthenticated(): boolean;
}
