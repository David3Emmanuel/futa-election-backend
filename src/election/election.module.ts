import { Module } from '@nestjs/common'
import { ElectionService } from './election.service'
import { ElectionController } from './election.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Election, ElectionSchema } from 'src/schemas/election.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Election.name, schema: ElectionSchema },
    ]),
  ],
  providers: [ElectionService],
  controllers: [ElectionController],
})
export class ElectionModule {}
