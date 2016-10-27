export class UserPresence {
  username(): string;

  isAvailable(): boolean;

  state(key: string): any;

  state(): Map<string, any>;
}
