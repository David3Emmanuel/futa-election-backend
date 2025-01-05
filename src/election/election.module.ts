import { Module } from '@nestjs/common'
import { ElectionService } from './election.service'
import { ElectionController } from './election.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Election, ElectionSchema } from 'src/schemas/election.schema'
import { CandidateModule } from 'src/candidate/candidate.module'
import { VoterModule } from 'src/voter/voter.module'
import { CronModule } from 'src/cron/cron.module'
import { ConfigService } from '@nestjs/config'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Election.name, schema: ElectionSchema },
    ]),
    CandidateModule,
    VoterModule,
    CronModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        apiKey: config.getOrThrow<string>('CRONJOB_API_KEY'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [ElectionService],
  controllers: [ElectionController],
  exports: [ElectionService],
})
export class ElectionModule {}
