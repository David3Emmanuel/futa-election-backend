import { Module } from '@nestjs/common'
import { CandidateService } from './candidate.service'
import { CandidateController } from './candidate.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Candidate, CandidateSchema } from 'src/schemas/candidate.schema'
import { NestjsFormDataModule } from 'nestjs-form-data'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Candidate.name, schema: CandidateSchema },
    ]),
    NestjsFormDataModule,
  ],
  providers: [CandidateService],
  controllers: [CandidateController],
  exports: [CandidateService],
})
export class CandidateModule {}
