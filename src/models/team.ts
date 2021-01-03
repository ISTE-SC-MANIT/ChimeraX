import { getModelForClass, prop, index } from "@typegoose/typegoose";
import { Field, ObjectType, Int, registerEnumType } from "type-graphql";

export enum PaymentStatus {
  PAID = "PAID",
  UNPAID = "UNPAID",
}
registerEnumType(PaymentStatus, {
  name: "PaymentStatus",
  description: "payment status of team",
});

export enum TeamStatus {
  INDIVIDUAL = "INDIVIDUAL",
  TEAM = "TEAM",
  NOT_INITIALIZED = "NOT_INITIALIZED",
}
registerEnumType(TeamStatus, {
  name: "TeamStatus",
  description: "tells wether player is individual or team",
});

@ObjectType()
export class Team {
  @Field({ nullable: true })
  _id?: string;

  @Field({ nullable: true })
  id?: string;

  @Field()
  @prop({ required: true })
  teamLeadersId: string;

  @Field()
  @prop({ required: true })
  invitationId: string;

  @Field({ nullable: true })
  @prop({ default: "" })
  teamHelpersId: string;

  @Field({ nullable: true })
  @prop({ default: "" })
  teamName: string;

  @Field({ nullable: true })
  @prop({ default: "" })
  city: string;

  @Field((type) => TeamStatus)
  @prop({ required: true })
  teamStatus: TeamStatus;

  @Field((type) => PaymentStatus)
  @prop({ enum: PaymentStatus, default: PaymentStatus.UNPAID })
  status: PaymentStatus;
}

export default getModelForClass(Team);
