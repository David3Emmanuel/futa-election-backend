import { Module } from '@nestjs/common'
import { ElectionService } from './election.service'
import { ElectionController } from './election.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Election, ElectionSchema } from 'src/schemas/election.schema'
import { CandidateModule } from 'src/candidate/candidate.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Election.name, schema: ElectionSchema },
    ]),
    CandidateModule,
  ],
  providers: [ElectionService],
  controllers: [ElectionController],
})
export class ElectionModule {}
