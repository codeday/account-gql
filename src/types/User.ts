import { ObjectType, Field, ID, Authorized } from "type-graphql";
import { AuthRole } from "../context";
import { Badge } from "./Badge";
import { Role } from "./Role";

@ObjectType()
export class DiscordInformation {
  @Field(() => String)
  username: string;

  @Field(() => String)
  discriminator: string;

  @Field(() => String)
  handle: string;

  @Field(() => String)
  tag: string;

  @Field(() => String, { nullable: true })
  avatar?: string;
}

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Authorized(AuthRole.ADMIN, AuthRole.READ)
  @Field(() => Boolean)
  blocked: boolean = false;

  @Authorized(AuthRole.ADMIN, AuthRole.USER, AuthRole.READ)
  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String)
  username: string;

  @Field(() => String, { nullable: true })
  picture?: string;

  @Authorized(AuthRole.ADMIN, AuthRole.USER, AuthRole.READ)
  @Field(() => String, { nullable: true })
  givenName?: string;

  @Authorized(AuthRole.ADMIN, AuthRole.USER, AuthRole.READ)
  @Field(() => String, { nullable: true })
  familyName?: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  title?: string;

  @Field(() => String, { nullable: true })
  bio?: string;

  @Field(() => String, { nullable: true })
  discordId?: string;

  @Field(() => String, { nullable: true })
  githubUsername?: string;

  @Authorized(AuthRole.ADMIN, AuthRole.USER, AuthRole.READ)
  @Field(() => Boolean, { nullable: true })
  acceptTos?: boolean;

  @Field(() => String, { nullable: true })
  displayNameFormat?: string;

  @Authorized(AuthRole.ADMIN, AuthRole.USER, AuthRole.READ)
  @Field(() => String, { nullable: true })
  phoneNumber?: string;

  @Field(() => String, { nullable: true })
  pronoun?: string;

  @Field(() => [Role])
  roles: Role[] = [];

  @Field(() => [Badge])
  badges: Badge[] = [];

  @Field(() => DiscordInformation, { nullable: true })
  discordInformation?: DiscordInformation;
}

export type IUser = User;

@ObjectType()
export class SubscriptionUser {
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  username?: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  pronoun?: string;

  @Field(() => String, { nullable: true })
  bio?: string;

  @Field(() => String, { nullable: true })
  discordId?: string;

  @Field(() => String, { nullable: true })
  picture?: string;

  @Field(() => [Role], { nullable: "itemsAndList" })
  roles?: Role[];

  @Field(() => [Badge], { nullable: "itemsAndList" })
  badges?: Badge[];
}
