import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Candidate } from 'src/schemas/candidate.schema'

export class BulkAddResponseDTO {
  @ApiProperty() created: number
  @ApiProperty() updated: number
}

export class BulkAddRequestDTO {
  @ApiProperty({ type: [Candidate] }) candidates: Candidate[]
}

export class UpdateCandidateDTO {
  @ApiPropertyOptional() name?: string
  @ApiPropertyOptional() currentPosition?: string
  @ApiPropertyOptional() imageUrl?: string
}
