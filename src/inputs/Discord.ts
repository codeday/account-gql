import { Field, InputType } from "type-graphql";

@InputType()
export class DiscordTokenInfoInput {
  @Field(() => String)
  accessToken: string;

  @Field(() => String)
  refreshToken: string;

  @Field(() => String)
  tokenType: string = "Bearer";

  @Field(() => String)
  scope: string;

  @Field(() => Number)
  expiresIn: number;
}
