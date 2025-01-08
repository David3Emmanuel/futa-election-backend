import { ApiProperty } from '@nestjs/swagger'
import { ElectionWithId, getYear } from 'src/schemas/election.schema'

export function hideVotes(election: ElectionWithId): ElectionWithoutVotes {
  return {
    ...election,
    votes: undefined,
    voteCount: election.votes?.length ?? 0,
    year: getYear(election),
  }
}

export class ElectionWithoutVotes extends ElectionWithId {
  votes: undefined
  @ApiProperty() voteCount: number
  @ApiProperty() year: number
}
