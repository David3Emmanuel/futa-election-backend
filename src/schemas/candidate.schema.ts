import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Document, HydratedDocument, Types } from 'mongoose'

@Schema()
export class Candidate {
  @ApiProperty() @Prop({ required: true }) name: string
  @ApiProperty() @Prop({ required: true }) currentPosition: string
  @ApiPropertyOptional() @Prop() imageUrl: string
  @ApiPropertyOptional({
    example: { 2024: 'position' },
    description: 'All positions that this candidate has run for by year',
  })
  @Prop({ type: Map, of: String })
  pastPositions?: Record<number, string>
}

export class CandidateWithId extends Candidate {
  _id: Types.ObjectId
}

export function extractCandidate(
  candidateDocument: Document<unknown, object, Candidate>,
) {
  return candidateDocument.toObject({ versionKey: false })
}

export const CandidateSchema = SchemaFactory.createForClass(Candidate)

export type CandidateDocument = HydratedDocument<Candidate>
