export interface UserPresence {
  readonly username: string;

  readonly available: boolean;

  readonly state: Map<string, any>;
}
