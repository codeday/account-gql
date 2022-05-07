import { Authorized, Field, ID, InputType } from "type-graphql";
import { AuthRole } from "../context";

@InputType()
export class UpdateUserInput {
  @Field(() => String, { nullable: true })
  username?: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  givenName?: string;

  @Field(() => String, { nullable: true })
  familyName?: string;

  @Field(() => String, { nullable: true })
  displayNameFormat?: string;

  @Field(() => String, { nullable: true })
  title?: string;

  @Field(() => String, { nullable: true })
  bio?: string;

  @Field(() => String, { nullable: true })
  phoneNumber?: string;

  @Field(() => String, { nullable: true })
  pronoun?: string;

  @Authorized(AuthRole.ADMIN, AuthRole.WRITE)
  @Field(() => Boolean, { nullable: true })
  blocked?: boolean;

  @Field(() => Boolean, { nullable: true })
  acceptTos?: boolean;
}
