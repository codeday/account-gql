import { ObjectType, Field, ID, registerEnumType } from "type-graphql";
import { SubscriptionUser } from "./User";

@ObjectType()
export class Badge {
  @Field(() => ID)
  id: string;

  @Field(() => Boolean, { nullable: true })
  displayed?: boolean;

  @Field(() => Number, { nullable: true })
  order?: number | null;

  @Field(() => String, { nullable: true })
  expiresUtc?: string | null;
}

@ObjectType()
export class SubscriptionBadge {
  @Field(() => String, { nullable: true })
  type: string;

  @Field(() => SubscriptionUser)
  user: SubscriptionUser;

  @Field(() => Badge)
  badge: Badge;
}

export enum PizzaOrTurtle {
  TURTLE = "TURTLE",
  PIZZA = "PIZZA",
}
registerEnumType(PizzaOrTurtle, {
  name: "PizzaOrTurtle",
});