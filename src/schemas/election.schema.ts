import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose'
import { Document, HydratedDocument, Types } from 'mongoose'
import { Voter } from './voter.schema'
import { Candidate } from './candidate.schema'
import { Vote } from './vote.schema'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

@Schema()
export class Election {
  @ApiProperty() @Prop({ required: true }) year: number
  @ApiProperty() @Prop([String]) positions: string[]
  @ApiProperty()
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Voter' }] })
  voters: Voter[]
  @ApiProperty()
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Voter' }] })
  candidates: Candidate[]
  @ApiPropertyOptional() @Prop([Vote]) votes?: Vote[]
  @ApiProperty() @Prop() startDate: Date
  @ApiProperty() @Prop() endDate: Date
  @ApiProperty()
  @Virtual({
    get: function (this: Election) {
      return this.startDate <= new Date() && this.endDate >= new Date()
    },
  })
  active: boolean
}

export class ElectionWithId extends Election {
  @ApiProperty() _id: Types.ObjectId
}

export function extractElection(
  electionDocument: Document<unknown, object, Election>,
) {
  return electionDocument.toObject({ versionKey: false })
}

export const ElectionSchema = SchemaFactory.createForClass(Election)

export type ElectionDocument = HydratedDocument<Election>
