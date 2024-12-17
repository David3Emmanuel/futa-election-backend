import { Module } from '@nestjs/common'
import { VoterService } from './voter.service'
import { VoterController } from './voter.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Voter, VoterSchema } from 'src/schemas/voter.schema'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Voter.name, schema: VoterSchema }]),
  ],
  providers: [VoterService],
  controllers: [VoterController],
  exports: [VoterService],
})
export class VoterModule {}
