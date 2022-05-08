import { Field, ID, InputType, Int } from "type-graphql";
import { UserPictureFit } from "../types/Picture";

@InputType()
export class UserPictureTransformInput {
  @Field(() => UserPictureFit, { nullable: true })
  fit: UserPictureFit;

  @Field(() => Int, { nullable: true })
  width?: number;

  @Field(() => Int, { nullable: true })
  height?: number;
}
