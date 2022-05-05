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
  @Field(() => Boolean, { nullable: true })
  blocked?: boolean;

  @Authorized(AuthRole.ADMIN, AuthRole.USER, AuthRole.READ)
  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  username?: string;

  @Field(() => String, { nullable: true })
  picture?: string;

  @Authorized(AuthRole.ADMIN, AuthRole.USER, AuthRole.READ)
  @Field(() => String, { nullable: true })
  givenName?: string;

  @Authorized(AuthRole.ADMIN, AuthRole.USER, AuthRole.READ)
  @Field(() => String, { nullable: true })
  familyName?: String;

  @Field(() => String, { nullable: true })
  name?: String;

  @Field(() => String, { nullable: true })
  title?: String;

  @Field(() => String, { nullable: true })
  bio?: String;

  @Field(() => String, { nullable: true })
  discordId?: String;

  @Authorized(AuthRole.ADMIN, AuthRole.USER, AuthRole.READ)
  @Field(() => Boolean, { nullable: true })
  acceptTos?: Boolean;

  @Field(() => String, { nullable: true })
  displayNameFormat?: String;

  @Authorized(AuthRole.ADMIN, AuthRole.USER, AuthRole.READ)
  @Field(() => String, { nullable: true })
  phoneNumber?: String;

  @Field(() => String, { nullable: true })
  pronoun?: String;

  @Field(() => [Role], { nullable: true })
  roles?: [Role];

  @Field(() => [Badge], { nullable: true })
  badges?: Badge[];

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
  name?: String;

  @Field(() => String, { nullable: true })
  pronoun?: String;
  
  @Field(() => String, { nullable: true })
  bio?: String;

  @Field(() => String, { nullable: true })
  discordId?: String;
  
  @Field(() => String, { nullable: true })
  picture?: string;

  @Field(() => [Role], { nullable: true })
  roles?: [Role];

  @Field(() => [Badge], { nullable: true })
  badges?: Badge[];
}