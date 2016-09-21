export declare class UserPresence {
  username(): string;

  // todo should we be doing isAvailable()?
  available(): boolean;

  state(): Map<string, any>;
}
