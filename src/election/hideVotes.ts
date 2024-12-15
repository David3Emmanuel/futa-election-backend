import { ApiProperty } from '@nestjs/swagger'
import { ElectionWithId } from 'src/schemas/election.schema'

export function hideVotes(election: ElectionWithId): ElectionWithoutVotes {
  return { ...election, votes: undefined }
}
export class ElectionWithoutVotes extends ElectionWithId {
  @ApiProperty() votes: undefined
}
