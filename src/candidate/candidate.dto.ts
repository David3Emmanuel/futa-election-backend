import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsFile, MemoryStoredFile } from 'nestjs-form-data'

export class BulkAddResponseDTO {
  @ApiProperty() created: number
  @ApiProperty() updated: number
  @ApiProperty() ids: string[]
}

export class CreateCandidateDTO {
  @ApiProperty() name: string
  @ApiProperty() currentPosition: string
  // TODO add image field
}

export class BulkAddRequestDTO {
  @ApiProperty({ type: [CreateCandidateDTO] }) candidates: CreateCandidateDTO[]
}

export class UpdateCandidateDTO {
  @ApiPropertyOptional() name?: string
  @ApiPropertyOptional() currentPosition?: string
}

export class UploadImageDTO {
  @IsFile() image: MemoryStoredFile
}
