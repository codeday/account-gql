export enum AuthRole {
  USER = "u",
  ADMIN = "A",
  READ = "r",
  WRITE = "w",
}

export interface JwtToken {
  t: AuthRole;
  u?: string; // user id
}

// for compatability with the old auth system
export interface LegacyJwtToken {
  id?: string; // user id
  scopes?: string;
}
