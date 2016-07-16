// TODO later we may want to group the convergence options under a sub interface
interface ConvergenceOptions {
  connectionTimeout: number;
  maxReconnectAttempts: number;
  reconnectInterval: number;
  retryOnOpen: boolean;
}
