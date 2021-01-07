import { Context } from "../index";
import UserModel, { User, Step, Role, UserQuizStatus } from "../models/user";
import TeamModel, {
  Team,
  TeamStatus,
  PaymentStatus,
  QuizStatus,
} from "../models/team";
import Razorpay from "razorpay";
import "reflect-metadata";
import { Resolver, Arg, Ctx, Mutation, Authorized } from "type-graphql";
import {
  UserInput,
  InvitationInput,
  AcceptInvitationInput,
  DeleteInvitationInput,
  Order,
  PayOrderInput,
  CreateOrderInput,
  CreateQuestionInput,
  SubmitQuizInput,
  StartQuizResponse,
} from "./registerInput";
import InvitationModel, { Invitation, Status } from "../models/invitation";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import env from "dotenv";
import QuestionModel, { Question } from "../models/questions";
import { forEach } from "lodash";
env.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});

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
      id: uuidv4(),
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

      const sender = await UserModel.findById(senderId);
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
      }).save();

      await UserModel.findByIdAndUpdate(senderId, {
        step: Step.PAYMENT,
        teamId: team._id,
        teamStatus: TeamStatus.TEAM,
        role: Role.TEAM_LEADER,
      });
      await UserModel.findByIdAndUpdate(receiverId, {
        step: Step.PAYMENT,
        teamId: team._id,
        teamStatus: TeamStatus.TEAM,
        role: Role.TEAM_HELPER,
      });

      return team;
    } catch (e) {
      console.log(e);
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

      return invitation;
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
        invitationId: user._id,
        city: user.city,
        teamStatus: TeamStatus.INDIVIDUAL,
      }).save();

      await UserModel.findByIdAndUpdate(user._id, {
        step: Step.PAYMENT,
        teamId: team._id,
        teamStatus: TeamStatus.INDIVIDUAL,
        role: Role.TEAM_LEADER,
      });
      return team;
    } catch (e) {
      console.log(e);
      throw new Error("Something went wrong! try again");
    }
  }

  @Mutation((returns) => Order)
  async createOrder(
    @Ctx() context: Context,
    @Arg("createOrderInput") createOrderInput: CreateOrderInput
  ) {
    try {
      const user = await UserModel.findById(context.user._id);
      const team = await TeamModel.findById(user.teamId);

      if (
        !user ||
        user.step != Step.PAYMENT ||
        user.teamStatus === TeamStatus.NOT_INITIALIZED ||
        user.role != Role.TEAM_LEADER ||
        !team
      ) {
        throw new Error("Invalid User");
      }
      const options = {
        amount: 100,
        currency: "INR",
        receipt: uuidv4(),
        payment_capture: 1,
      };
      const response = await razorpay.orders.create(options);
      await TeamModel.findByIdAndUpdate(user.teamId, {
        teamName: createOrderInput.teamName,
      });
      return {
        id: response.id,
        currency: response.currency,
        amount: response.amount,
      };
    } catch {
      throw new Error("Something went wrong! try again");
    }
  }

  @Mutation((returns) => Team)
  async payOrder(
    @Arg("payOrderInput") payOrderInput: PayOrderInput,
    @Ctx() context: Context
  ) {
    try {
      const user = await UserModel.findById(context.user._id);
      const team = await TeamModel.findById(user.teamId);

      if (
        !user ||
        user.step != Step.PAYMENT ||
        user.teamStatus === TeamStatus.NOT_INITIALIZED ||
        user.role != Role.TEAM_LEADER ||
        !team
      ) {
        throw new Error("Invalid User");
      }
      const payment = await axios.get(
        `https://${process.env.RAZORPAY_KEY}:${process.env.RAZORPAY_SECRET}@api.razorpay.com/v1/payments/${payOrderInput.paymentId}`
      );

      if (!payment.data.captured) {
        throw new Error("Payment was not completed, please try again");
      }

      await UserModel.findByIdAndUpdate(team.teamLeadersId, {
        step: Step.TEST,
        paymentId: "",
      });
      if (team.teamStatus === TeamStatus.TEAM) {
        await UserModel.findByIdAndUpdate(team.teamHelpersId, {
          step: Step.TEST,
          paymentId: "",
        });
      }

      const updatedTeam = await TeamModel.findByIdAndUpdate(team._id, {
        status: PaymentStatus.PAID,
      });
      return updatedTeam;
    } catch (e) {
      console.log(e);
      throw new Error("Something went wrong! try again");
    }
  }

  @Mutation((returns) => Question)
  async createQuestion(
    @Arg("createQuestionInput") createQuestionInput: CreateQuestionInput,
    @Ctx() context: Context
  ) {
    try {
      const userId = context.user._id;
      const user = await UserModel.findById(userId);

      if (user.role != Role.ADMIN) {
        throw new Error("Unauthorized");
      }
      const {
        question,
        // questionAssets,
        questionNumber,
        questionType,
        answer,
      } = createQuestionInput;
      const newQuestion = await new QuestionModel({
        question,
        // questionAssets,
        questionNo: questionNumber,
        questionType,
        answer,
      }).save();

      return newQuestion;
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }

  @Mutation((returns) => Team)
  async submitQuiz(
    @Arg("submitQuizInput") submitQuizInput: SubmitQuizInput,
    @Ctx() context: Context
  ) {
    try {
      const userId = context.user._id;
      const user = await UserModel.findById(userId);
      const team = await TeamModel.findById(context.user.teamId);
      await UserModel.findByIdAndUpdate(userId, {
        quizEndTime: new Date().toISOString(),
        quizStatus: UserQuizStatus.ENDED,
      });
      if (user.role === Role.TEAM_HELPER) {
        return team;
      }

      const questions = await QuestionModel.find();

      if (team.quizStatus === QuizStatus.SUBMITTED) {
        throw new Error("Quiz has been already submitted");
      }

      if (user.role != Role.TEAM_LEADER) {
        throw new Error("Unauthorized");
      }

      let score = 0;

      forEach(submitQuizInput.responses, (response) => {
        const rightAnswer = questions.find(
          (question) => question._id === response.questionId
        ).answer;
        if (rightAnswer == response.answer) score = score + 1;
      });

      const updatedTeam = TeamModel.findByIdAndUpdate(team._id, {
        score,
        quizStatus: QuizStatus.SUBMITTED,
      });

      return updatedTeam;
    } catch (e) {
      console.log(e);
      throw new Error("Something went wrong! try again");
    }
  }
  @Mutation((returns) => StartQuizResponse)
  async startQuiz(@Ctx() context: Context) {
    try {
      const userId = context.user._id;
      const currentTime = new Date().toISOString();
      const user = await UserModel.findByIdAndUpdate(userId, {
        quizStatus: UserQuizStatus.STARTED,
        quizStartTime: currentTime,
      });

      return { quizStartTime: user.quizStartTime };
    } catch (e) {
      console.log(e);
      throw new Error("Something went wrong! try again");
    }
  }
}
