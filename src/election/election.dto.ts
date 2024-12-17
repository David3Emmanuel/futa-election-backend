import { ApiProperty } from '@nestjs/swagger'
import { IsDate, IsOptional } from 'class-validator'
import { Candidate } from 'src/schemas/candidate.schema'

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
    type: [Candidate],
  })
  @IsOptional()
  candidates?: Candidate[]
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
    type: [Candidate],
  })
  @IsOptional()
  candidates?: Candidate[]
}
