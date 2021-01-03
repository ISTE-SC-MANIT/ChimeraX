import { Context } from "../index";
import UserModel, { User, Step } from "../models/user";
import "reflect-metadata";
import { Resolver, Query, Ctx, Authorized } from "type-graphql";
import { InvitationResponse } from "./registerInput";
import InvitationModel from "../models/invitation";
import { filter, find } from "lodash";
import invitation from "../models/invitation";

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
    const singleUsers = await UserModel.find({ step: Step.CHOOSE_TEAM });
    const sentInvitations = await InvitationModel.find({
      sendersId: context.user._id,
    });
    // console.log(singleUsers);

    const filteredUsers = filter(singleUsers, (user) => {
      const exists = find(
        sentInvitations,
        (invitation) => invitation.receiversId === user._id.toString()
      );
      console.log(
        context.user._id,
        user._id,
        context.user._id.toString() == user._id
      );
      if (
        user._id.toString() === context.user._id.toString() ||
        Boolean(exists)
      ) {
        console.log(user, context.user);
        return false;
      }
      return true;
    });

    return filteredUsers;
  }
}
