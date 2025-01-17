import { ApiProperty } from '@nestjs/swagger'

export class ResendEmailsDto {
  @ApiProperty({ type: [String], description: 'List of emails to include' })
  includedEmails: string[]
}
