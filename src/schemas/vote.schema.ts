import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { CandidateWithId } from './candidate.schema'
import { VoterWithId } from './voter.schema'
import { ApiProperty } from '@nestjs/swagger'

@Schema()
export class Vote {
  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Voter', required: true })
  voter: VoterWithId
  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Candidate', required: true })
  candidate: CandidateWithId
}

export const VoteSchema = SchemaFactory.createForClass(Vote)
