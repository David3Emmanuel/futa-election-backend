import { ApiProperty } from '@nestjs/swagger'
import { IsDate, IsOptional, IsArray, IsMongoId } from 'class-validator'
import {
  BulkAddResponseDTO,
  CreateCandidateDTO,
} from 'src/candidate/candidate.dto'
import { CandidateWithId } from 'src/schemas/candidate.schema'
import { Voter } from 'src/schemas/voter.schema'
import { ElectionWithoutVotes } from './hideVotes'

export class CreateElectionDTO {
  @ApiProperty({
    description: 'A date between now and end of the year. Defaults to tomorrow',
  })
  @IsOptional()
  @IsDate()
  start?: Date

  @ApiProperty({
    description:
      'A date after the start date. Defaults to 14 days from start date',
  })
  @IsOptional()
  @IsDate()
  end?: Date

  @ApiProperty({
    description: 'A list containing new/updated candidates',
    type: [CreateCandidateDTO],
  })
  @IsOptional()
  candidates?: CreateCandidateDTO[]

  @ApiProperty({
    description: 'A list containing new/updated voters',
    type: [Voter],
  })
  @IsOptional()
  voters?: Voter[]
}

export class UpdateElectionDTO {
  @ApiProperty({
    description: 'A date between now and end of the year',
  })
  @IsOptional()
  @IsDate()
  start?: Date

  @ApiProperty({
    description: 'A date after the start date',
  })
  @IsOptional()
  @IsDate()
  end?: Date

  @ApiProperty({
    description:
      'A list containing new/updated candidates. Does not support deletion',
    type: [CreateCandidateDTO],
  })
  @IsOptional()
  candidates?: CreateCandidateDTO[]

  @ApiProperty({
    description:
      'A list containing new/updated voters. Does not support deletion',
    type: [Voter],
  })
  @IsOptional()
  voters?: Voter[]
}

export class DeleteCandidatesOrVotersDTO {
  @ApiProperty({
    description: 'List of candidate IDs to delete',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  candidateIds?: string[]

  @ApiProperty({
    description: 'List of voter IDs to delete',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  voterIds?: string[]
}

class CandidatePollResult {
  candidate: CandidateWithId
  count: number
}

export class PositionSummary {
  @ApiProperty() totalVotes: number
  @ApiProperty() leadingCandidates: CandidatePollResult[]
}

export class ElectionSummary {
  @ApiProperty() totalVotes: number
  @ApiProperty({
    type: 'object',
    properties: {
      totalVotes: { type: 'number' },
      leadingCandidates: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            candidate: { type: 'object' },
            count: { type: 'number' },
          },
        },
      },
    },
  })
  positions: Record<string, PositionSummary>
  @ApiProperty() year: number
  @ApiProperty() startDate: Date
  @ApiProperty() endDate: Date
  @ApiProperty() active: boolean
}

export type JobStatusResult = 'Success' | 'Failed' | 'Skipped'

export class CreateElectionResponse {
  message: 'Success'
  candidates?: BulkAddResponseDTO
  voters?: BulkAddResponseDTO
  jobStatus: {
    start: JobStatusResult
    end: JobStatusResult
  }
}

export class FetchElectionResponse extends ElectionWithoutVotes {
  @ApiProperty() numberOfCandidates: number
  @ApiProperty() numberOfVoters: number
}

export function addPeopleCount(election: ElectionWithoutVotes) {
  return Object.assign(new FetchElectionResponse(), election, {
    numberOfCandidates: election.candidateIds.length,
    numberOfVoters: election.voterIds.length,
  }) as FetchElectionResponse
}
