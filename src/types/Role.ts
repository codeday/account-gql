import { ObjectType, Field, ID } from "type-graphql";

@ObjectType()
export class Role {
  @Field(() => ID)
  id: string;

  @Field(() => String, {nullable: true})
  name?: string;

  @Field(() => String, {nullable: true})
  description?: string;
}
export type IRole = Role;
