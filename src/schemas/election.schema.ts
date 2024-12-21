import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, HydratedDocument, Types } from 'mongoose'
import { Vote } from './vote.schema'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export function getYear(election: Election) {
  return election.startDate.getFullYear()
}

export function isActive(election: Election) {
  return election.startDate <= new Date() && election.endDate >= new Date()
}

@Schema()
export class Election {
  // @ApiProperty() @Prop([String]) positions: string[]
  // FIXME ensure only specified positions can be used
  @ApiProperty() @Prop([String]) voterIds: string[]
  @ApiProperty() @Prop([String]) candidateIds: string[]
  @ApiPropertyOptional() @Prop([Vote]) votes?: Vote[]
  @ApiProperty() @Prop() startDate: Date
  @ApiProperty() @Prop() endDate: Date
}

export class ElectionWithId extends Election {
  @ApiProperty() _id: Types.ObjectId
}

export function extractElection(
  electionDocument: Document<unknown, object, Election>,
) {
  return electionDocument.toObject({ versionKey: false }) as ElectionWithId
}

export const ElectionSchema = SchemaFactory.createForClass(Election)

export type ElectionDocument = HydratedDocument<Election>
