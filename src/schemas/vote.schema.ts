import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { Candidate } from './candidate.schema'
import { Voter } from './voter.schema'
import { ApiProperty } from '@nestjs/swagger'

@Schema()
export class Vote {
  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Voter', required: true })
  voter: Voter
  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Candidate', required: true })
  candidate: Candidate
}

export const VoteSchema = SchemaFactory.createForClass(Vote)
