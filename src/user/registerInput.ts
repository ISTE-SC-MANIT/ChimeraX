import { InputType, Field, ObjectType } from "type-graphql";
import { Invitation } from "../models/invitation";

@InputType()
export class UserInput {
  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  phone: string;

  @Field({ nullable: true })
  year: number;

  @Field({ nullable: true })
  country: string;

  @Field({ nullable: true })
  college: string;
}

@InputType()
export class InvitationInput {
  @Field()
  receiverId: string;

  @Field()
  receiverName: string;

  @Field()
  receiverEmail: string;
}

@InputType()
export class AcceptInvitationInput {
  @Field()
  invitationId: string;

  @Field()
  receiverId: string;
}

@ObjectType()
export class InvitationResponse {
  @Field((type) => [Invitation])
  sentInvitations: [Invitation];

  @Field((type) => [Invitation])
  receivedInvitations: [Invitation];
}
