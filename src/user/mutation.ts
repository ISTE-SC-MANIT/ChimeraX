import { Context } from "../index";
import UserModel, { User, Step, Role } from "../models/user";
import TeamModel, { Team, TeamStatus } from "../models/team";
import "reflect-metadata";
import { Resolver, Arg, Ctx, Mutation, Authorized } from "type-graphql";
import { v4 as uuidv4 } from "uuid";
import {
  UserInput,
  InvitationInput,
  AcceptInvitationInput,
  DeleteInvitationInput,
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
        $set: { ...payload, step: Step.CHOOSE_TEAM },
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
      id: `invitation_${uuidv4()}`,
    }).save();

    return invitation;
  }

  @Mutation((returns) => Team)
  async acceptInvitation(
    @Arg("acceptInvitationInput") acceptInvitationInput: AcceptInvitationInput,
    @Ctx() context: Context
  ) {
    try {
      const senderId = context.user._id;
      const receiverId = acceptInvitationInput.receiverId;

      const sender = await UserModel.findById({ senderId });
      const receiver = await UserModel.findById(receiverId);

      if (
        sender.teamStatus != TeamStatus.NOT_INITIALIZED ||
        receiver.teamStatus != TeamStatus.NOT_INITIALIZED
      ) {
        throw new Error("Player already in other team");
      }
      const invitation = await InvitationModel.findByIdAndUpdate(
        { _id: acceptInvitationInput.invitationId },
        { status: Status.ACCEPTED },
        { new: true }
      );

      if (!invitation) {
        throw new Error("Invalid invitation Id");
      }

      const team = await new TeamModel({
        teamLeadersId: senderId,
        teamHelpersId: receiverId,
        invitationId: invitation._id,
        city: sender.city,
        teamStatus: TeamStatus.TEAM,
        id: `team_${uuidv4()}`,
      }).save();

      await UserModel.findByIdAndUpdate(
        { senderId },
        {
          step: Step.PAYMENT,
          teamId: team._id,
          teamStatus: TeamStatus.TEAM,
          role: Role.TEAM_LEADER,
        }
      );
      await UserModel.findByIdAndUpdate(
        { receiverId },
        {
          step: Step.PAYMENT,
          teamId: team._id,
          teamStatus: TeamStatus.TEAM,
          role: Role.TEAM_HELPER,
        }
      );

      return team;
    } catch {
      throw new Error("Something went wrong! try again");
    }
  }

  @Mutation((returns) => Invitation)
  async deleteInvitation(
    @Arg("deleteInvitationInput") deleteInvitationInput: DeleteInvitationInput,
    @Ctx() context: Context
  ) {
    try {
      const invitation = await InvitationModel.findByIdAndDelete({
        _id: deleteInvitationInput.invitationId,
      });

      if (!invitation) {
        throw new Error("Invalid invitation Id");
      }

      return { ...invitation, _id: "" };
    } catch {
      throw new Error("Something went wrong! try again");
    }
  }

  @Mutation((returns) => Team)
  async playAsIndividual(@Ctx() context: Context) {
    try {
      const user = await UserModel.findById(context.user._id);

      if (!user || user.teamStatus != TeamStatus.NOT_INITIALIZED) {
        throw new Error("Invalid User");
      }

      const team = await new TeamModel({
        teamLeadersId: user._id,
        teamHelpersId: "",
        invitationId: "",
        city: user.city,
        teamStatus: TeamStatus.INDIVIDUAL,
        id: `team_${uuidv4()}`,
      }).save();

      await UserModel.findByIdAndUpdate(user._id, {
        step: Step.PAYMENT,
        teamId: team._id,
        teamStatus: TeamStatus.INDIVIDUAL,
        role: Role.TEAM_LEADER,
      });
      return team;
    } catch {
      throw new Error("Something went wrong! try again");
    }
  }
}
