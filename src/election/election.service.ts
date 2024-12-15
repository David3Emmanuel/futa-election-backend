import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Election } from 'src/schemas/election.schema'

@Injectable()
export class ElectionService {
  constructor(@InjectModel(Election.name) private model: Model<Election>) {}
}
