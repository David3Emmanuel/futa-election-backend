import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose'
import { Document, HydratedDocument, Types } from 'mongoose'
import { Voter, VoterWithId } from './voter.schema'
import { Candidate, CandidateWithId } from './candidate.schema'
import { Vote } from './vote.schema'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

@Schema()
export class Election {
  @ApiProperty()
  @Virtual({
    get: function (this: Election) {
      return this.startDate.getFullYear()
    },
  })
  year: number
  // @ApiProperty() @Prop([String]) positions: string[]
  // FIXME ensure only specified positions can be used
  @ApiProperty()
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Voter' }] })
  voters: Voter[]
  @ApiProperty()
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Candidate' }] })
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
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Voter' }] })
  voters: VoterWithId[]
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Candidate' }] })
  candidates: CandidateWithId[]
}

export function extractElection(
  electionDocument: Document<unknown, object, Election>,
) {
  return electionDocument.toObject({ versionKey: false }) as ElectionWithId
}

export const ElectionSchema = SchemaFactory.createForClass(Election)

export type ElectionDocument = HydratedDocument<Election>
