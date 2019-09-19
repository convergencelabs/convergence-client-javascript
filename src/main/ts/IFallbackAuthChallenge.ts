export interface IFallbackAuthChallenge {
  password(password: string | (() => string) | Promise<string>): void;
  jwt(jwt: string | (() => string) | Promise<string>): void;
  anonymous(displayName: string | (() => string) | Promise<string>): void;
  cancel(): void;
}
