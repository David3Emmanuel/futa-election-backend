import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class VoteDTO {
  @ApiProperty({
    description: 'The candidate ID',
  })
  @IsString()
  @IsNotEmpty()
  candidateId: string
}
