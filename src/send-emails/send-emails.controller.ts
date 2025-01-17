import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common'
import { SendEmailsService } from './send-emails.service'
import { ApiBearerAuth } from '@nestjs/swagger'
import { JWTAuthGuard } from 'src/auth/jwt-auth.guard'
import { ResendEmailsDto } from './send-emails.dto'

@Controller('send-emails')
export class SendEmailsController {
  constructor(private readonly sendEmailsService: SendEmailsService) {}

  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  @Get('reminder')
  sendReminderEmails() {
    return this.sendEmailsService.sendBulkReminderEmails()
  }

  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  @Get('pre-post')
  sendOtherEmails() {
    return this.sendEmailsService.sendPreOrPostElectionEmails()
  }

  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  @Post('resend-pre')
  async resendPreOrPostEmails(@Body() resendEmailsDto: ResendEmailsDto) {
    await this.sendEmailsService.sendPreElectionToSelectEmails(
      resendEmailsDto.includedEmails,
    )
    return { message: 'Emails sent successfully' }
  }
}
