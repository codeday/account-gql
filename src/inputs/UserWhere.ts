import { Field, ID, InputType } from "type-graphql";

@InputType()
export class UsersWhere {
  @Field(() => ID, { nullable: true })
  id: string;

  @Field(() => String, { nullable: true })
  username?: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  discordId?: String;
}
