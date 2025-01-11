import { Module } from '@nestjs/common'
import { SendEmailsController } from './send-emails.controller'
import { SendEmailsService } from './send-emails.service'
import { ElectionModule } from 'src/election/election.module'
import { EmailModule } from 'src/email/email.module'
import { ConfigService } from '@nestjs/config'
import { VoteModule } from 'src/vote/vote.module'
import { VoterModule } from 'src/voter/voter.module'

@Module({
  controllers: [SendEmailsController],
  providers: [SendEmailsService],
  imports: [
    ElectionModule,
    VoteModule,
    VoterModule,
    EmailModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        auth: config.getOrThrow<string>('BREVO_API_KEY'),
        senderDomain: config.getOrThrow<string>('SENDER_DOMAIN'),
        senderName: 'FUTA Election',
      }),
      inject: [ConfigService],
    }),
  ],
})
export class SendEmailsModule {}
