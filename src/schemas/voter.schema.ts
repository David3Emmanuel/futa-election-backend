import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { Document, HydratedDocument, Types } from 'mongoose'

@Schema()
export class Voter {
  @ApiProperty()
  @Prop({ required: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ })
  email: string
}

export class VoterWithId extends Voter {
  _id: Types.ObjectId
}

export function extractVoter(voterDocument: Document<unknown, object, Voter>) {
  return voterDocument.toObject({ versionKey: false })
}

export const VoterSchema = SchemaFactory.createForClass(Voter)

export type VoterDocument = HydratedDocument<Voter>
