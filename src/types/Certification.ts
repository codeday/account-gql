import { ObjectType, Field, ID} from "type-graphql";

@ObjectType()
export class Certification {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  type: string;

  @Field(() => String)
  certificatePdf: string;

  @Field(() => String)
  recordPdf: string;

  @Field(() => String, { nullable: true })
  expiresAt?: string | null;
}