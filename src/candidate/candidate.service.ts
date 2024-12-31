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
import {
  BulkAddResponseDTO,
  CreateCandidateDTO,
  UpdateCandidateDTO,
} from './candidate.dto'
import { CloudinaryService } from 'src/cloudinary/cloudinary.service'
import { MemoryStoredFile } from 'nestjs-form-data'

@Injectable()
export class CandidateService {
  constructor(
    @InjectModel(Candidate.name) private model: Model<Candidate>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

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

  async createCandidate(candidate: CreateCandidateDTO): Promise<void> {
    try {
      await this.getCandidateByName(candidate.name)
      throw new ConflictException('Candidate already exists')
    } catch (e) {
      if (e instanceof NotFoundException) {
        await new this.model(candidate).save()
      } else throw e
    }
  }

  async removeCandidate(id: string): Promise<void> {
    await this.getCandidateById(id)
    await this.model.findByIdAndDelete(id).exec()
  }

  async updateCandidate(id: string, update: UpdateCandidateDTO): Promise<void> {
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
    candidates: CreateCandidateDTO[],
  ): Promise<BulkAddResponseDTO> {
    let created = 0,
      updated = 0
    const ids: string[] = []

    await Promise.all(
      candidates.map(async (candidate) => {
        try {
          const existing = await this.getCandidateByName(candidate.name)
          await this.updateCandidate(existing._id.toString(), candidate)
          updated += 1
          ids.push(existing._id.toString())
        } catch (e) {
          if (e instanceof NotFoundException) {
            await this.createCandidate(candidate)
            created += 1
            const new_candidate = await this.getCandidateByName(candidate.name)
            ids.push(new_candidate._id.toString())
          } else throw e
        }
      }),
    )

    return { created, updated, ids }
  }

  async uploadImage(id: string, file: MemoryStoredFile) {
    const candidate = await this.getCandidateById(id)
    const result = await this.cloudinaryService.uploadImage(
      file,
      candidate._id.toString(),
      'futa-election',
    )

    if (!result) throw new Error('Error uploading image')
    const imageUrl = result.secure_url

    await this.model.updateOne(
      {
        _id: candidate._id,
      },
      { imageUrl },
    )

    return { candidateId: id, imageUrl }
  }
}
