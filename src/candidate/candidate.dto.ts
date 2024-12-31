import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class BulkAddResponseDTO {
  @ApiProperty() created: number
  @ApiProperty() updated: number
  @ApiProperty() ids: string[]
}

export class CreateCandidateDTO {
  @ApiProperty() name: string
  @ApiProperty() currentPosition: string
}

export class BulkAddRequestDTO {
  @ApiProperty({ type: [CreateCandidateDTO] }) candidates: CreateCandidateDTO[]
}

export class UpdateCandidateDTO {
  @ApiPropertyOptional() name?: string
  @ApiPropertyOptional() currentPosition?: string
}
