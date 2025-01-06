import { ApiProperty } from '@nestjs/swagger'
import { IsDate, IsOptional } from 'class-validator'
import {
  BulkAddResponseDTO,
  CreateCandidateDTO,
} from 'src/candidate/candidate.dto'
import { CandidateWithId } from 'src/schemas/candidate.schema'
import { Voter } from 'src/schemas/voter.schema'

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

export class CreateElectionResponse {
  message: 'Success'
  candidates?: BulkAddResponseDTO
  voters?: BulkAddResponseDTO
  jobStatus: {
    start: 'Success' | 'Failed'
    end: 'Success' | 'Failed'
  }
}
