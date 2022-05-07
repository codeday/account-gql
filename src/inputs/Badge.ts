import { Field, ID, InputType, Int } from "type-graphql";

@InputType()
export class BadgeInput {
  @Field(() => ID)
  id: string;

  @Field(() => Boolean, { nullable: true })
  displayed?: boolean;

  @Field(() => Int, { nullable: true })
  order?: number | null;

  @Field(() => String, { nullable: true })
  expiresUtc?: string | null;
}

@InputType()
export class DisplayedBadgeInput {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  order: number | null;
}
