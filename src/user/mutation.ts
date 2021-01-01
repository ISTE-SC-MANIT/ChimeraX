import { Context } from "../index";
import UserModel, { User, Step } from "../models/user";
import "reflect-metadata";
import { Resolver, Arg, Ctx, Mutation, Authorized } from "type-graphql";
import {
  UserInput,
  InvitationInput,
  AcceptInvitationInput,
} from "./registerInput";
import InvitationModel, { Invitation, Status } from "../models/invitation";

@Resolver()
export default class MutationClass {
  @Mutation((returns) => User)
  async registerUser(
    @Arg("userInfo") userInput: UserInput,
    @Ctx() context: Context
  ) {
    const payload: Partial<UserInput> = {
      ...userInput,
    };

    const user = await UserModel.findOneAndUpdate(
      { email: context.user.email },
      {
        $set: { ...payload },
      },
      {
        new: true,
      }
    );
    console.log(user);

    if (!user) return null;

    return user;
  }

  @Mutation((returns) => Invitation)
  async sendInvitation(
    @Arg("invitationInput") invitationInput: InvitationInput,
    @Ctx() context: Context
  ) {
    const invitation = await new InvitationModel({
      receiversId: invitationInput.receiverId,
      receiversName: invitationInput.receiverName,
      receiversEmail: invitationInput.receiverEmail,
      sendersId: context.user._id,
      sendersEmail: context.user.email,
      sendersName: context.user.name,
    }).save();

    return invitation;
  }

  @Mutation((returns) => Invitation)
  async acceptInvitation(
    @Arg("acceptInvitationInput") acceptInvitationInput: AcceptInvitationInput,
    @Ctx() context: Context
  ) {
    const invitation = await InvitationModel.findByIdAndUpdate(
      { _id: acceptInvitationInput.invitationId },
      { status: Status.ACCEPTED },
      { new: true }
    );
    const senderId = context.user._id;
    const receiverId = acceptInvitationInput.receiverId;

    await UserModel.findByIdAndUpdate({ senderId }, { step: Step.PAYMENT });
    await UserModel.findByIdAndUpdate({ receiverId }, { step: Step.PAYMENT });

    return invitation;
  }
}
