import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsOptional } from 'class-validator'
import { Voter } from 'src/schemas/voter.schema'

export class BulkAddResponseDTO {
  @ApiProperty() created: number
  @ApiProperty() updated: number
  @ApiProperty() ids: string[]
}

export class BulkAddRequestDTO {
  @ApiProperty({ type: [Voter] }) voters: Voter[]
}

export class UpdateVoterDTO {
  @ApiPropertyOptional() @IsOptional() name?: string
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string
}
