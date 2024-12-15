import { Controller } from '@nestjs/common'
import { ElectionService } from './election.service'

@Controller('election')
export class ElectionController {
  constructor(private readonly electionService: ElectionService) {}
}
