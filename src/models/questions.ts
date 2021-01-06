import { getModelForClass, prop, index } from "@typegoose/typegoose";
import { Field, ObjectType, Int, registerEnumType } from "type-graphql";

export enum QuestionType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
}
registerEnumType(QuestionType, {
  name: "QuestionType",
  description: "type of question",
});

@ObjectType()
export class Question {
  @Field({ nullable: true })
  _id?: string;

  @Field({ nullable: true })
  id?: string;

  @Field()
  @prop({ required: true })
  question: string;

  @Field()
  @prop({ default: "" })
  questionAssets?: string;

  @Field()
  @prop({ required: true })
  answer?: string;

  @Field()
  @prop({ required: true })
  questionNo?: number;

  @Field((type) => QuestionType)
  @prop({ enum: QuestionType, required: true })
  questionType: QuestionType;
}

export default getModelForClass(Question);
