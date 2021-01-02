import { getModelForClass, prop, index } from "@typegoose/typegoose";
import { Field, ObjectType, Int, registerEnumType } from "type-graphql";

export enum Step {
  REGISTER = "REGISTER",
  CHOOSE_TEAM = "CHOOSE_TEAM",
  PAYMENT = "PAYMENT",
  TEST = "TEST",
}
registerEnumType(Step, {
  name: "Step",
  description: "Step on which user is present",
});

@ObjectType()
export class User {
  @Field({ nullable: true })
  _id?: string;

  @Field()
  @prop({ required: true })
  password: string;

  @Field()
  @prop({ default: "" })
  name?: string;

  @Field()
  @prop({ required: true })
  email: string;

  @Field()
  @prop({ default: "" })
  phone?: string;

  @Field({ nullable: true })
  @prop({ default: "" })
  college?: string;

  @Field((type) => Int)
  @prop({ default: 0 })
  year?: number;

  @Field()
  @prop({ required: true })
  strategy: string;

  @Field()
  @prop({ default: false })
  registered: boolean;

  @Field()
  @prop({ default: "" })
  city: string;

  @Field()
  @prop({ default: "" })
  resetPasswordLink: string;

  @Field((type) => Step)
  @prop({ enum: Step, default: Step.REGISTER })
  step: Step;
}

export default getModelForClass(User);
