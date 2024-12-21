import { forwardRef, Module } from '@nestjs/common'
import { ElectionService } from './election.service'
import { ElectionController } from './election.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Election, ElectionSchema } from 'src/schemas/election.schema'
import { CandidateModule } from 'src/candidate/candidate.module'
import { VoterModule } from 'src/voter/voter.module'
import { EmailModule } from 'src/email/email.module'
import { ConfigService } from '@nestjs/config'
import { VoteModule } from 'src/vote/vote.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Election.name, schema: ElectionSchema },
    ]),
    CandidateModule,
    VoterModule,
    forwardRef(() => VoteModule),
    EmailModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        apiKey: config.getOrThrow<string>('MAILERSEND_API_KEY'),
        senderDomain: config.getOrThrow<string>('SENDER_DOMAIN'),
        senderName: 'FUTA Election',
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [ElectionService],
  controllers: [ElectionController],
  exports: [ElectionService],
})
export class ElectionModule {}
