import { Context } from "../index";
import UserModel, { User, Step } from "../models/user";
import "reflect-metadata";
import { Resolver, Query, Ctx, Authorized } from "type-graphql";
import { InvitationResponse } from "./registerInput";
import InvitationModel from "../models/invitation";

@Resolver()
export default class QueryClass {
  @Query((returns) => User)
  // @Authorized("USER")
  async viewer(@Ctx() context: Context) {
    const user = await UserModel.findOne({ email: context.user.email });
    user.id = user._id;
    return user;
  }

  @Query((returns) => InvitationResponse)
  async getInvitations(@Ctx() context: Context) {
    const sentInvitations = await InvitationModel.find({
      sendersId: context.user._id,
    });
    const receivedInvitations = await InvitationModel.find({
      receiversId: context.user._id,
    });

    return {
      sentInvitations: sentInvitations,
      receivedInvitations: receivedInvitations,
    };
  }

  @Query((returns) => [User])
  async getSingleUsers(@Ctx() context: Context) {
    const singleUsers = await await UserModel.find({ step: Step.CHOOSE_TEAM });

    console.log(singleUsers);
    console.log(context.user._id);

    return singleUsers;
  }
}
