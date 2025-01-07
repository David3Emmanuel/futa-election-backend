import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger'
import { Document, HydratedDocument, Types } from 'mongoose'
import { mapToObjectWithNumberKeys } from 'src/util'

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
  pastPositions?: Map<string, string>
}

export class ProcessedCandidate extends OmitType(Candidate, ['pastPositions']) {
  pastPositions: Record<number, string>
}

export class CandidateWithId extends ProcessedCandidate {
  _id: Types.ObjectId
}

export function extractCandidate(
  candidateDocument: Document<unknown, object, Candidate>,
): CandidateWithId {
  const rawCandidate = candidateDocument.toObject({ versionKey: false })
  const pastPositions = mapToObjectWithNumberKeys(
    rawCandidate.pastPositions || new Map(),
  )
  return { ...rawCandidate, pastPositions }
}

export const CandidateSchema = SchemaFactory.createForClass(Candidate)

export type CandidateDocument = HydratedDocument<Candidate>
