import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
  Candidate,
  CandidateWithId,
  extractCandidate,
} from 'src/schemas/candidate.schema'
import { BulkAddResponseDTO } from './candidate.dto'

@Injectable()
export class CandidateService {
  constructor(@InjectModel(Candidate.name) private model: Model<Candidate>) {}

  async getAllCandidates(): Promise<CandidateWithId[]> {
    return (await this.model.find().exec()).map(extractCandidate)
  }

  async getCandidateById(id: string): Promise<CandidateWithId> {
    const candidate = await this.model.findById(id).exec()
    if (!candidate) throw new NotFoundException('Candidate not found')
    return extractCandidate(candidate)
  }

  async getCandidateByName(name: string): Promise<CandidateWithId> {
    const candidate = await this.model
      .findOne({
        name: name,
      })
      .exec()
    if (!candidate) throw new NotFoundException('Candidate not found')
    return extractCandidate(candidate)
  }

  async createCandidate(candidate: Candidate): Promise<void> {
    try {
      await this.getCandidateByName(candidate.name)
      throw new ConflictException('Candidate already exists')
    } catch (e) {
      if (e instanceof NotFoundException) {
        console.log('  Creating new candidate:', candidate.name)
        await new this.model(candidate).save()
        console.log('  Created candidate', new this.model(candidate)._id)
      } else throw e
    }
  }

  async removeCandidate(id: string): Promise<void> {
    await this.getCandidateById(id)
    await this.model.findByIdAndDelete(id).exec()
  }

  async updateCandidate(id: string, update: Partial<Candidate>): Promise<void> {
    let candidate = await this.getCandidateById(id)
    candidate = { ...candidate, ...update }
    await this.model.updateOne(
      {
        _id: candidate._id,
      },
      update,
    )
  }

  async bulkAddCandidates(
    candidates: Candidate[],
  ): Promise<BulkAddResponseDTO> {
    let created = 0,
      updated = 0
    const ids: string[] = []

    await Promise.all(
      candidates.map(async (candidate) => {
        try {
          const existing = await this.getCandidateByName(candidate.name)
          console.log(
            'Found existing candidate: ',
            candidate.name,
            existing._id.toString(),
          )
          await this.updateCandidate(existing._id.toString(), candidate)
          updated += 1
          ids.push(existing._id.toString())
        } catch (e) {
          if (e instanceof NotFoundException) {
            console.log('Adding new candidate: ', candidate.name)
            await this.createCandidate(candidate)
            created += 1
            const new_candidate = await this.getCandidateByName(candidate.name)
            console.log('New candidate: ', new_candidate)
            ids.push(new_candidate._id.toString())
          } else throw e
        }

        console.log({ created, updated, ids })
      }),
    )

    return { created, updated, ids }
  }
}
