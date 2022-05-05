import { verify } from "jsonwebtoken";
import config from "../../config";
import { JwtToken, AuthRole, LegacyJwtToken } from "./JwtToken";

export class AuthContext {
  private readonly token?: JwtToken;


  constructor(token?: string) {
    if (!token) return;
    this.token = <JwtToken>verify(
      token,
      config.auth.secret
    );
    this.validate();
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  validate(): void {
    if (this.isAdmin && this.user) {
      throw Error("Admin tokens may not specify a username");
    }
    if (this.isUser && !this.user) {
      throw Error("Manager/Volunteer tokens require username");
    }
  }

  get isAuthenticated(): boolean {
    return Boolean(this.token);
  }

  get type(): AuthRole | undefined {
    return this.token?.t;
  }

  get isAdmin(): boolean {
    return this.type === AuthRole.ADMIN;
  }

  get isUser(): boolean {
    return this.type === AuthRole.USER;
  }
  get user(): string | undefined {
    return this.token?.u || undefined;
  }

  get read(): boolean {
    return this.type === AuthRole.ADMIN;
  }

  get write(): boolean {
    return this.type === AuthRole.ADMIN;
  }
}

export class LegacyAuthContext {
  private readonly token?: LegacyJwtToken;

  private readonly scopes: string[]

  constructor(token?: string) {
    if (!token) return;
    this.token = <LegacyJwtToken>verify(
      token,
      config.auth.secret
    );
    if (!this.token?.id) {
      this.scopes = this.token?.scopes?.split(/\s+/g) || []
    }
  }

  get isAuthenticated(): boolean {
    return Boolean(this.token);
  }

  get type(): AuthRole | undefined {
    if (this.token?.id) {
      return AuthRole.USER;
    }
    const read = <boolean><unknown> this.scopes.reduce((accum, scope): boolean => scope.startsWith("read:") || accum, false)
    const write = <boolean><unknown> this.scopes.reduce((accum, scope): boolean => scope.startsWith("write:") || accum, false)
    if (read && write) {
      return AuthRole.ADMIN;
    } else 
    if (read) {
      return AuthRole.READ;
    } else if (write) {
      return AuthRole.WRITE;
    }
    return;
  }

  get isAdmin(): boolean {
    return this.type === AuthRole.ADMIN;
  }

  get isUser(): boolean {
    return this.type === AuthRole.USER;
  }

  get user(): string | undefined {
    return this.token?.id || undefined;
  }

  get read(): boolean {
    return this.type === AuthRole.READ;
  }

  get write(): boolean {
    return this.type === AuthRole.WRITE;
  }
}
