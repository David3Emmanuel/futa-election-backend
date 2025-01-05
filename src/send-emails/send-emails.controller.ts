import { Controller, Get, UseGuards } from '@nestjs/common'
import { SendEmailsService } from './send-emails.service'
import { ApiBearerAuth } from '@nestjs/swagger'
import { JWTAuthGuard } from 'src/auth/jwt-auth.guard'

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
}
