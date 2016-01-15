module convergence {

    import Session = convergence.Session;
    class SessionImpl implements  Session {
        /**
         * @return The ConvergenceDomain for this session
         */
        getConvergenceDomain(): ConvergenceDomain {
            return null;
        }


        /**
         * @return The sessionId of the connected client
         */
        getSessionId(): string {
            return null;
        }

        /**
         * @return The username of the authenticated client or null if not authenticated
         */
        getUsername(): string {
            return null;
        }

        /**
         * @return True if the client is connected to the domain
         */
        isConnected(): boolean {
            return false;
        }

        /**
         * @return True if the client is authenticated
         */
        isAuthenticated(): boolean {
            return false;
        }
    }
}