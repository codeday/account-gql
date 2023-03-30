import { Field, ID, InputType } from "type-graphql";

@InputType()
export class UserWhereInput {
  @Field(() => ID, { nullable: true })
  id: string;

  @Field(() => String, { nullable: true })
  username?: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  discordId?: string;

  @Field(() => String, { nullable: true })
  githubUsername?: string;
}
