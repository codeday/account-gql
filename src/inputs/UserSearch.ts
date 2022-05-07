import { Field, InputType } from "type-graphql";

@InputType()
export class UserSearch {
  @Field(() => String, { nullable: true })
  familyName: string;

  @Field(() => String, { nullable: true })
  givenName?: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  username?: string;
}
