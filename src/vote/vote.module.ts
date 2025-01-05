import { Module } from '@nestjs/common'
import { VoteController } from './vote.controller'
import { VoteService } from './vote.service'
import { EmailModule } from 'src/email/email.module'
import { ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { JWTVoteStrategy } from './jwt-vote.strategy'
import { VoterModule } from 'src/voter/voter.module'
import { ElectionModule } from 'src/election/election.module'

@Module({
  imports: [
    EmailModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        senderDomain: process.env.SENDER_DOMAIN!,
        senderName: 'FUTA Election',
        apiKey: config.getOrThrow<string>('MAILERSEND_API_KEY'),
      }),
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET_KEY'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
    ElectionModule,
    VoterModule,
  ],
  controllers: [VoteController],
  providers: [VoteService, JWTVoteStrategy],
  exports: [VoteService],
})
export class VoteModule {}
