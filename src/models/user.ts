import { getModelForClass, prop, index } from "@typegoose/typegoose";
import { Field, ObjectType, Int, registerEnumType } from "type-graphql";
import { TeamStatus } from "./team";

export enum Step {
  REGISTER = "REGISTER",
  CHOOSE_TEAM = "CHOOSE_TEAM",
  PAYMENT = "PAYMENT",
  TEST = "TEST",
}

export enum Role {
  TEAM_LEADER = "TEAM_LEADER",
  TEAM_HELPER = "TEAM_HELPER",
  NOT_INITIALIZED = "NOT_INITIALIZED",
}
registerEnumType(Step, {
  name: "Step",
  description: "Step on which user is present",
});

registerEnumType(Role, {
  name: "Role",
  description: "role of user in team",
});

@ObjectType()
export class User {
  @Field({ nullable: true })
  _id?: string;

  @Field()
  @prop({ required: true })
  id: string;

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

  @Field()
  @prop({ default: "" })
  teamId: string;

  @Field((type) => Step)
  @prop({ enum: Step, default: Step.REGISTER })
  step: Step;

  @Field((type) => Role)
  @prop({ enum: Role, default: Role.NOT_INITIALIZED })
  role: Role;

  @Field((type) => TeamStatus)
  @prop({ enum: TeamStatus, default: TeamStatus.NOT_INITIALIZED })
  teamStatus: TeamStatus;
}

export default getModelForClass(User);
