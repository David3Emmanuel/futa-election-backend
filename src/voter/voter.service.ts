import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Voter, VoterWithId, extractVoter } from 'src/schemas/voter.schema'
import { BulkAddResponseDTO } from './voter.dto'

@Injectable()
export class VoterService {
  constructor(@InjectModel(Voter.name) private model: Model<Voter>) {}

  async getAllVoters(): Promise<VoterWithId[]> {
    return (await this.model.find().exec()).map(extractVoter)
  }

  async getVoterById(id: string): Promise<VoterWithId> {
    const voter = await this.model.findById(id).exec()
    if (!voter) throw new NotFoundException('Voter not found')
    return extractVoter(voter)
  }

  async getVoterByName(name: string): Promise<VoterWithId> {
    const voter = await this.model
      .findOne({
        name: name,
      })
      .exec()
    if (!voter) throw new NotFoundException('Voter not found')
    return extractVoter(voter)
  }

  async createVoter(voter: Voter): Promise<void> {
    try {
      await this.getVoterByName(voter.name)
      throw new ConflictException('Voter already exists')
    } catch (e) {
      if (e instanceof NotFoundException) {
        await new this.model(voter).save()
      } else throw e
    }
  }

  async removeVoter(id: string): Promise<void> {
    await this.getVoterById(id)
    await this.model.findByIdAndDelete(id).exec()
  }

  async updateVoter(id: string, update: Partial<Voter>): Promise<void> {
    let voter = await this.getVoterById(id)
    voter = { ...voter, ...update }
    await this.model.updateOne(
      {
        _id: voter._id,
      },
      update,
    )
  }

  async bulkAddVoters(voters: Voter[]): Promise<BulkAddResponseDTO> {
    let created = 0,
      updated = 0
    const ids: string[] = []

    await Promise.all(
      voters.map(async (voter) => {
        try {
          const existing = await this.getVoterByName(voter.name)
          await this.updateVoter(existing._id.toString(), voter)
          updated += 1
          ids.push(existing._id.toString())
        } catch (e) {
          if (e instanceof NotFoundException) {
            await this.createVoter(voter)
            created += 1
            const new_voter = await this.getVoterByName(voter.name)
            ids.push(new_voter._id.toString())
          } else throw e
        }
      }),
    )

    return { created, updated, ids }
  }
}
