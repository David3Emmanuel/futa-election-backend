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
    const existing = await this.getCandidateByName(candidate.name)
    if (existing) throw new ConflictException('Candidate already exists')
    await this.model.create(candidate)
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
    candidates.forEach(async (candidate) => {
      try {
        const existing = await this.getCandidateByName(candidate.name)
        await this.updateCandidate(existing._id.toString(), candidate)
        updated += 1
      } catch (e) {
        if (e instanceof NotFoundException) {
          await this.createCandidate(candidate)
          created += 1
        } else throw e
      }
    })

    return { created, updated }
  }
}
